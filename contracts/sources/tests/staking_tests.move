#[test_only]
module ddc::staking_tests {
    use sui::test_scenario as ts;
    use sui::clock::Clock;
    use sui::coin;

    use ddc::test_helpers;
    use ddc::nft::GameNFT;
    use ddc::staking::{Self, StakingPool};
    use ddc::token::TOKEN;

    const PLAYER: address = @0x1;

    #[test]
    fun test_stake_and_unstake_nft() {
        let mut scenario = ts::begin(@0x1);
        test_helpers::init_modules_for_testing(&mut scenario);

        let (nft, mut pool) = setup_staking_scenario(&mut scenario);
        let nft_id = object::id(&nft);
        let clock = ts::take_shared<Clock>(&scenario);

        // Test staking
        ts::next_tx(&mut scenario, PLAYER);
        {
            let ctx = ts::ctx(&mut scenario);
            staking::stake_nft(&mut pool, nft, &clock, ctx);
        };

        // Test unstaking
        ts::next_tx(&mut scenario, PLAYER);
        {
            let ctx = ts::ctx(&mut scenario);
            let (nft, reward) = staking::unstake_nft(&mut pool, nft_id, &clock, ctx);
            transfer::public_transfer(nft, PLAYER);
            transfer::public_transfer(reward, PLAYER);
        };

        ts::return_shared(pool);
        ts::return_shared(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_claim_rewards() {
        let mut scenario = ts::begin(@0x1);
        test_helpers::init_modules_for_testing(&mut scenario);

        let (nft, mut pool) = setup_staking_scenario(&mut scenario);
        let nft_id = object::id(&nft);
        let clock = ts::take_shared<Clock>(&scenario);

        // Stake NFT
        ts::next_tx(&mut scenario, PLAYER);
        {
            let ctx = ts::ctx(&mut scenario);
            staking::stake_nft(&mut pool, nft, &clock, ctx);
        };

        // Claim rewards
        ts::next_tx(&mut scenario, PLAYER);
        {
            let ctx = ts::ctx(&mut scenario);
            let reward = staking::claim_rewards(&mut pool, nft_id, &clock, ctx);
            transfer::public_transfer(reward, PLAYER);
        };

        ts::return_shared(pool);
        ts::return_shared(clock);
        ts::end(scenario);
    }

    fun setup_staking_scenario(scenario: &mut ts::Scenario): (GameNFT, StakingPool) {
        // Initialize staking pool
        ts::next_tx(scenario, PLAYER);
        {
            let ctx = ts::ctx(scenario);
            staking::init_for_testing(ctx);
        };

        // Add rewards to the pool
        ts::next_tx(scenario, PLAYER);
        {
            let mut pool = ts::take_shared<StakingPool>(scenario);
            let ctx = ts::ctx(scenario);
            let payment = coin::mint_for_testing<TOKEN>(1000000000, ctx);
            staking::add_rewards(&mut pool, payment, ctx);
            ts::return_shared(pool);
        };

        // Create NFT and return with pool
        let nft = test_helpers::mint_test_nft(
            scenario,
            b"Test NFT",
            100, // power
            50,  // health
            50,  // defense
            50,  // speed
            PLAYER
        );
        let pool = ts::take_shared<StakingPool>(scenario);

        (nft, pool)
    }
}