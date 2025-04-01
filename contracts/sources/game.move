#[allow(lint(self_transfer))]
module ddc::game {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    // Error codes
    const EInvalidNFT: u64 = 0;
    const EInvalidAttributes: u64 = 3;

    // NFT struct
    struct NFT has key {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        attributes: Attributes,
        owner: address,
        rarity: u8,
    }

    public fun get_owner(nft: &NFT): address {
        nft.owner
    }

    public fun get_rarity(nft: &NFT): u8 {
        nft.rarity
    }

    public fun get_winner(battle: &BattleResult): ID {
        battle.winner
    }

    public fun get_experience_gained(battle: &BattleResult): u64 {
        battle.experience_gained
    }

    // NFT attributes
    struct Attributes has store {
        strength: u8,
        speed: u8,
        luck: u8,
        experience: u64,
        level: u8,
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
    }

    struct BattleCompleted has copy, drop {
        battle_id: ID,
        winner: ID,
        loser: ID,
        experience_gained: u64,
    }

    // === Public Functions ===

    public fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        rarity: u8,
        ctx: &mut TxContext
    ) {
        // Validate rarity
        assert!(rarity <= 3, EInvalidAttributes);

        // Create NFT with random attributes based on rarity
        let attributes = generate_attributes(rarity);
        
        let nft = NFT {
            id: object::new(ctx),
            name,
            description,
            image_url,
            attributes,
            owner: tx_context::sender(ctx),
            rarity,
        };

        // Emit event
        event::emit(NFTMinted {
            nft_id: object::id(&nft),
            owner: tx_context::sender(ctx),
            name: nft.name,
            rarity: nft.rarity,
        });

        // Transfer NFT to sender
        transfer::transfer(nft, tx_context::sender(ctx));
    }

    public fun initiate_battle(
        nft1: &mut NFT,
        nft2: &mut NFT,
        ctx: &mut TxContext
    ) {
        // Validate ownership
        assert!(nft1.owner == tx_context::sender(ctx), EInvalidNFT);
        
        // Calculate battle result
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

        // Update NFT attributes
        if (winner == 1) {
            update_nft_attributes(nft1, experience_gained);
        } else {
            update_nft_attributes(nft2, experience_gained);
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

    // === Private Functions ===

    fun generate_attributes(_rarity: u8): Attributes {
        let base_multiplier = if (_rarity == 0) 1
            else if (_rarity == 1) 2
            else if (_rarity == 2) 3
            else 4;

        Attributes {
            strength: ((base_multiplier * 20) as u8),
            speed: ((base_multiplier * 15) as u8),
            luck: ((base_multiplier * 10) as u8),
            experience: 0,
            level: 1,
        }
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
        let base_power = (attrs.strength as u64) * 2 +
                        (attrs.speed as u64) +
                        (attrs.luck as u64) +
                        (attrs.level as u64) * 10;
        
        base_power + (attrs.experience / 100)
    }

    fun update_nft_attributes(nft: &mut NFT, experience_gained: u64) {
        nft.attributes.experience = nft.attributes.experience + experience_gained;
        
        // Level up if enough experience
        while (nft.attributes.experience >= (nft.attributes.level as u64) * 1000) {
            nft.attributes.experience = nft.attributes.experience - (nft.attributes.level as u64) * 1000;
            nft.attributes.level = nft.attributes.level + 1;
        };
    }
} 