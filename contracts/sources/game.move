#[allow(lint(self_transfer))]
module ddc::game {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use std::option::{Self, Option};
    // Use the updated random module with proper functions
    use std::hash;
    use std::bcs;
    use std::vector;    
    // Error codes
    const EInvalidNFT: u64 = 0;
    // const EInvalidAttributes: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EAlreadyStaked: u64 = 3;
    const ENotStaked: u64 = 4;

    // Constants for mystery box probabilities (in basis points, 10000 = 100%)
    const LEGENDARY_CHANCE: u64 = 500; // 5%
    const EPIC_CHANCE: u64 = 1500; // 15%
    const RARE_CHANCE: u64 = 3000; // 30%
    // Remaining 50% is common

    // Base prices in SUI (1 SUI = 1_000_000_000)
    const BASE_PRICE: u64 = 200_000_000; // 0.2 SUI
    
    // Staking rewards (per day)
    const STAKING_REWARD_COMMON: u64 = 1_000_000; // 0.001 SUI
    const STAKING_REWARD_RARE: u64 = 2_000_000;
    const STAKING_REWARD_EPIC: u64 = 5_000_000;
    const STAKING_REWARD_LEGENDARY: u64 = 10_000_000;

    // NFT struct
    struct NFT has key, store {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        attributes: Attributes,
        owner: address,
        rarity: u8,
        staked_at: Option<u64>,
        experience: u64,
        level: u8
    }

    // Game admin for treasury management
    struct GameAdmin has key, store {
        id: UID,
        mint_count: u64,
        treasury: Table<u8, u64>, // Rarity -> Count mapping
    }

    // NFT attributes - Added copy and drop abilities
    struct Attributes has store, copy, drop {
        strength: u8,
        speed: u8,
        luck: u8,
    }

    // Battle result
    struct BattleResult has key, store {
        id: UID,
        winner: ID,
        loser: ID,
        timestamp: u64,
        experience_gained: u64,
        damage_dealt: u64,
    }

    // Events
    struct NFTMinted has copy, drop {
        nft_id: ID,
        owner: address,
        name: vector<u8>,
        rarity: u8,
        attributes: Attributes,
    }

    struct BattleCompleted has copy, drop {
        battle_id: ID,
        winner: ID,
        loser: ID,
        experience_gained: u64,
    }

    struct NFTStaked has copy, drop {
        nft_id: ID,
        timestamp: u64,
    }

    struct NFTUnstaked has copy, drop {
        nft_id: ID,
        rewards: u64,
    }

    fun internal_init(ctx: &mut TxContext) {
        let admin = GameAdmin {
            id: object::new(ctx),
            mint_count: 0,
            treasury: table::new(ctx),
        };
        // Initialize treasury counts
        table::add(&mut admin.treasury, 1u8, 0); // Common
        table::add(&mut admin.treasury, 2u8, 0); // Rare
        table::add(&mut admin.treasury, 3u8, 0); // Epic
        table::add(&mut admin.treasury, 4u8, 0); // Legendary
        
        transfer::share_object(admin);
    }

    /// Initialize the game module
    /// Note: This must be a one-time initialization function
    fun init(ctx: &mut TxContext) {
        internal_init(ctx); // only called during module publish
    }

    #[test_only] public fun test_init(ctx: &mut TxContext) {
        internal_init(ctx);
    }

    // Generate random number using clock
    fun generate_random(clock: &Clock, counter: u64): u64 {
        let timestamp = clock::timestamp_ms(clock);
        timestamp ^ counter
    }

    // Determine rarity based on random number
    fun determine_rarity(random: u64): u8 {
        let normalized = random % 10000;
        if (normalized < LEGENDARY_CHANCE) {
            4 // Legendary
        } else if (normalized < (LEGENDARY_CHANCE + EPIC_CHANCE)) {
            3 // Epic
        } else if (normalized < (LEGENDARY_CHANCE + EPIC_CHANCE + RARE_CHANCE)) {
            2 // Rare
        } else {
            1 // Common
        }
    }

    /// Generate random attributes based on rarity
    fun generate_attributes(rarity: u8): Attributes {
        let base_min: u8;
        let base_max: u8;
        
        if (rarity == 1) {
            base_min = 1;
            base_max = 10;
        } else if (rarity == 2) {
            base_min = 11;
            base_max = 20;
        } else if (rarity == 3) {
            base_min = 21;
            base_max = 30;
        } else {
            base_min = 31;
            base_max = 40;
        };

        // Use BCS bytes to generate pseudo-random values
        let rand_bytes = hash::sha3_256(bcs::to_bytes(&base_min));
        let rand1 = ((*(vector::borrow(&rand_bytes, 0)) % (base_max - base_min + 1)) + base_min);
        
        let rand_bytes = hash::sha3_256(bcs::to_bytes(&base_max));
        let rand2 = ((*(vector::borrow(&rand_bytes, 0)) % (base_max - base_min + 1)) + base_min);
        
        let seed = base_min + base_max;
        let rand_bytes = hash::sha3_256(bcs::to_bytes(&seed));
        let rand3 = ((*(vector::borrow(&rand_bytes, 0)) % (base_max - base_min + 1)) + base_min);

        Attributes {
            strength: rand1,
            speed: rand2,
            luck: rand3
        }
    }

    /// Mint a new NFT
    public entry fun mint_nft(
        admin: &mut GameAdmin,
        clock: &Clock,
        payment: Coin<SUI>,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Verify payment
        assert!(coin::value(&payment) >= BASE_PRICE, EInsufficientPayment);
        
        // Generate random rarity and attributes
        let random = generate_random(clock, admin.mint_count);
        let rarity = determine_rarity(random);
        let attributes = generate_attributes(rarity);
        
        // Create NFT
        let nft = NFT {
            id: object::new(ctx),
            name,
            description,
            image_url,
            attributes,
            owner: tx_context::sender(ctx),
            rarity,
            staked_at: option::none(),
            experience: 0,
            level: 1,
        };

        // Update treasury
        let count = table::borrow_mut(&mut admin.treasury, rarity);
        *count = *count + 1;
        admin.mint_count = admin.mint_count + 1;

        // Emit event
        event::emit(NFTMinted {
            nft_id: object::id(&nft),
            owner: tx_context::sender(ctx),
            name: nft.name,
            rarity: nft.rarity,
            attributes: nft.attributes,
        });

        // Refund excess payment
        if (coin::value(&payment) > BASE_PRICE) {
            let refund_amount = coin::value(&payment) - BASE_PRICE;
            let refund = coin::split(&mut payment, refund_amount, ctx);
            transfer::public_transfer(refund, tx_context::sender(ctx));
        };
        
        // Send the remaining payment to the treasury
        transfer::public_transfer(payment, tx_context::sender(ctx));

        // Transfer NFT to sender
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    // Stake NFT
    public entry fun stake_nft(
        nft: &mut NFT,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(option::is_none(&nft.staked_at), EAlreadyStaked);
        let timestamp = clock::timestamp_ms(clock);
        option::fill(&mut nft.staked_at, timestamp);
        
        event::emit(NFTStaked {
            nft_id: object::id(nft),
            timestamp,
        });
    }

    // Unstake NFT and claim rewards
    public entry fun unstake_nft(
        nft: &mut NFT,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(option::is_some(&nft.staked_at), ENotStaked);
        
        let start_time = option::extract(&mut nft.staked_at);
        let end_time = clock::timestamp_ms(clock);
        let duration = (end_time - start_time) / (24 * 60 * 60 * 1000); // Convert to days
        
        let daily_reward: u64;
        if (nft.rarity == 1) {
            daily_reward = STAKING_REWARD_COMMON;
        } else if (nft.rarity == 2) {
            daily_reward = STAKING_REWARD_RARE;
        } else if (nft.rarity == 3) {
            daily_reward = STAKING_REWARD_EPIC;
        } else {
            daily_reward = STAKING_REWARD_LEGENDARY;
        };

        let total_reward = daily_reward * duration;
        
        // Create and transfer reward
        let reward_coin = coin::mint_for_testing<SUI>(total_reward, ctx);
        transfer::public_transfer(reward_coin, tx_context::sender(ctx));

        // Update NFT
        nft.experience = nft.experience + (duration as u64);
        if (nft.experience >= 100 && nft.level < 99) {
            nft.level = nft.level + 1;
            nft.experience = 0;
        };

        event::emit(NFTUnstaked {
            nft_id: object::id(nft),
            rewards: total_reward,
        });
    }

    // === Battle System ===
    public fun initiate_battle(
        nft1: &mut NFT,
        nft2: &mut NFT,
        ctx: &mut TxContext
    ) {
        // Validate ownership
        assert!(nft1.owner == tx_context::sender(ctx), EInvalidNFT);
        
        // Calculate battle result using attributes
        let (winner, _loser, experience_gained, damage_dealt) = calculate_battle_result(
            &nft1.attributes,
            &nft2.attributes
        );

        // Create battle result
        let battle_result = BattleResult {
            id: object::new(ctx),
            winner: if (winner == 1) object::id(nft1) else object::id(nft2),
            loser: if (winner == 1) object::id(nft2) else object::id(nft1),
            timestamp: tx_context::epoch(ctx),
            experience_gained,
            damage_dealt,
        };

        // Update winner's experience
        if (winner == 1) {
            nft1.experience = nft1.experience + experience_gained;
            if (nft1.experience >= 100 && nft1.level < 99) {
                nft1.level = nft1.level + 1;
                nft1.experience = 0;
            }
        } else {
            nft2.experience = nft2.experience + experience_gained;
            if (nft2.experience >= 100 && nft2.level < 99) {
                nft2.level = nft2.level + 1;
                nft2.experience = 0;
            }
        };

        // Emit event
        event::emit(BattleCompleted {
            battle_id: object::id(&battle_result),
            winner: battle_result.winner,
            loser: battle_result.loser,
            experience_gained: battle_result.experience_gained,
        });

        // Transfer battle result to sender
        transfer::transfer(battle_result, tx_context::sender(ctx));
    }

    fun calculate_battle_result(
        attrs1: &Attributes,
        attrs2: &Attributes
    ): (u8, u8, u64, u64) {
        let power1 = calculate_power(attrs1);
        let power2 = calculate_power(attrs2);

        let winner = if (power1 >= power2) 1 else 2;
        let experience_gained = if (winner == 1) power2 else power1;
        let damage_dealt = if (winner == 1) power1 - power2 else power2 - power1;

        (winner, if (winner == 1) 2 else 1, experience_gained, damage_dealt)
    }

    fun calculate_power(attrs: &Attributes): u64 {
        ((attrs.strength as u64) * 2 +
         (attrs.speed as u64) +
         (attrs.luck as u64)) * 10
    }
}