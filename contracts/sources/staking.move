module ddc::staking {
    use sui::table::{Self, Table};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};

    use ddc::nft::GameNFT;
    use ddc::token::TOKEN;

    // Error codes
    const E_NOT_STAKED: u64 = 0;
    const E_ALREADY_STAKED: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_INSUFFICIENT_REWARDS: u64 = 3;

    // Staking constants
    const REWARDS_PER_DAY: u64 = 10_000_000; // 10 tokens per day (in smallest units)
    const SECONDS_PER_DAY: u64 = 86400;

    public struct StakeInfo has store, drop {
        nft_id: ID,
        owner: address,
        stake_time: u64,
        last_claim_time: u64
    }

    public struct StakingPool has key, store {
        id: UID,
        stakes: Table<ID, StakeInfo>,
        rewards_balance: Balance<TOKEN>,
        total_staked: u64
    }

    // Events
    public struct NFTStaked has copy, drop {
        nft_id: ID,
        owner: address,
        stake_time: u64
    }

    public struct NFTUnstaked has copy, drop {
        nft_id: ID,
        owner: address,
        total_time_staked: u64,
        rewards_claimed: u64
    }

    public struct RewardsClaimed has copy, drop {
        nft_id: ID,
        owner: address,
        amount: u64
    }

    fun init(ctx: &mut TxContext) {
        let staking_pool = StakingPool {
            id: object::new(ctx),
            stakes: table::new(ctx),
            rewards_balance: balance::zero(),
            total_staked: 0
        };
        transfer::public_share_object(staking_pool);
    }

    public fun add_rewards(
        pool: &mut StakingPool,
        payment: Coin<TOKEN>,
        _ctx: &mut TxContext
    ) {
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut pool.rewards_balance, payment_balance);
    }

    public fun stake_nft(
        pool: &mut StakingPool,
        nft: GameNFT,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let nft_id = object::id(&nft);
        assert!(!table::contains(&pool.stakes, nft_id), E_ALREADY_STAKED);

        let current_time = clock::timestamp_ms(clock);
        let owner = tx_context::sender(ctx);

        let stake_info = StakeInfo {
            nft_id,
            owner,
            stake_time: current_time,
            last_claim_time: current_time
        };

        table::add(&mut pool.stakes, nft_id, stake_info);
        pool.total_staked = pool.total_staked + 1;

        // Store NFT in dynamic field
        sui::dynamic_field::add(&mut pool.id, nft_id, nft);

        event::emit(NFTStaked {
            nft_id,
            owner,
            stake_time: current_time
        });
    }

    public fun unstake_nft(
        pool: &mut StakingPool,
        nft_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ): (GameNFT, Coin<TOKEN>) {
        assert!(table::contains(&pool.stakes, nft_id), E_NOT_STAKED);
        let stake_info = table::borrow(&pool.stakes, nft_id);
        assert!(stake_info.owner == tx_context::sender(ctx), E_NOT_OWNER);

        let current_time = clock::timestamp_ms(clock);
        let rewards = calculate_rewards(stake_info, current_time);
        assert!(balance::value(&pool.rewards_balance) >= rewards, E_INSUFFICIENT_REWARDS);

        // Remove stake and get NFT
        let nft = sui::dynamic_field::remove(&mut pool.id, nft_id);
        let stake_info = table::remove(&mut pool.stakes, nft_id);
        pool.total_staked = pool.total_staked - 1;

        // Create rewards coin
        let reward_coin = coin::from_balance(
            balance::split(&mut pool.rewards_balance, rewards),
            ctx
        );

        event::emit(NFTUnstaked {
            nft_id,
            owner: stake_info.owner,
            total_time_staked: current_time - stake_info.stake_time,
            rewards_claimed: rewards
        });

        (nft, reward_coin)
    }

    public fun claim_rewards(
        pool: &mut StakingPool,
        nft_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<TOKEN> {
        assert!(table::contains(&pool.stakes, nft_id), E_NOT_STAKED);
        let stake_info = table::borrow_mut(&mut pool.stakes, nft_id);
        assert!(stake_info.owner == tx_context::sender(ctx), E_NOT_OWNER);

        let current_time = clock::timestamp_ms(clock);
        let rewards = calculate_rewards(stake_info, current_time);
        assert!(balance::value(&pool.rewards_balance) >= rewards, E_INSUFFICIENT_REWARDS);

        // Update last claim time
        stake_info.last_claim_time = current_time;

        // Create rewards coin
        let reward_coin = coin::from_balance(
            balance::split(&mut pool.rewards_balance, rewards),
            ctx
        );

        event::emit(RewardsClaimed {
            nft_id,
            owner: stake_info.owner,
            amount: rewards
        });

        reward_coin
    }

    fun calculate_rewards(stake_info: &StakeInfo, current_time: u64): u64 {
        let time_staked = current_time - stake_info.last_claim_time;
        let days_staked = time_staked / (SECONDS_PER_DAY * 1000); // Convert ms to days
        days_staked * REWARDS_PER_DAY
    }

    // View functions
    public fun get_stake_info(pool: &StakingPool, nft_id: ID): (address, u64, u64) {
        let stake_info = table::borrow(&pool.stakes, nft_id);
        (stake_info.owner, stake_info.stake_time, stake_info.last_claim_time)
    }

    public fun get_pool_info(pool: &StakingPool): (u64, u64) {
        (pool.total_staked, balance::value(&pool.rewards_balance))
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
} 