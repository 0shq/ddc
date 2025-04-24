#[test_only]
module ddc::battle_tests {
    use sui::test_scenario as ts;
    use std::string;
    
    use ddc::battle::{Self, BattleArena};
    use ddc::nft::{Self, GameNFT};
    use ddc::test_helpers;

    #[test]
    fun test_battle_creation() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        // Initialize battle arena
        {
            battle::init_for_testing(ts::ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, test_helpers::admin_address());

        // Mint NFTs for testing
        {
            let ctx = ts::ctx(&mut scenario);
            
            // Create NFTs for both players
            let nft1 = nft::mint(
                string::utf8(b"Player 1 NFT"),
                100, // strength
                50,  // agility
                30,  // intelligence
                80,  // stamina
                ctx
            );
            
            let nft2 = nft::mint(
                string::utf8(b"Player 2 NFT"),
                90,  // strength
                60,  // agility
                40,  // intelligence
                70,  // stamina
                ctx
            );

            transfer::public_transfer(nft1, test_helpers::player1_address());
            transfer::public_transfer(nft2, test_helpers::player2_address());
        };

        ts::next_tx(&mut scenario, test_helpers::player1_address());

        // Create and test battle
        {
            let mut arena = ts::take_shared<BattleArena>(&scenario);
            let nft1 = ts::take_from_address<GameNFT>(&scenario, test_helpers::player1_address());
            let nft2 = ts::take_from_address<GameNFT>(&scenario, test_helpers::player2_address());

            let mut battle_obj = battle::create_battle(
                &mut arena,
                test_helpers::player1_address(),
                test_helpers::player2_address(),
                &nft1,
                &nft2,
                ts::ctx(&mut scenario)
            );

            // Test initial battle state
            assert!(battle::get_status(&battle_obj) == 0, 0); // BATTLE_CREATED
            assert!(battle::get_current_turn(&battle_obj) == test_helpers::player1_address(), 1);
            assert!(battle::get_winner(&battle_obj) == @0x0, 2);

            // Start battle and execute turn
            battle::start_battle(&mut battle_obj);
            battle::execute_turn(&mut arena, &mut battle_obj, &nft1, &nft2, ts::ctx(&mut scenario));

            // Transfer battle to player1
            transfer::public_transfer(battle_obj, test_helpers::player1_address());

            transfer::public_transfer(nft1, test_helpers::player1_address());
            transfer::public_transfer(nft2, test_helpers::player2_address());
            ts::return_shared(arena);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_battle_power_calculation() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        // Test power calculation
        {
            let ctx = ts::ctx(&mut scenario);
            let nft = nft::mint(
                string::utf8(b"Test NFT"),
                100, // strength
                50,  // agility
                30,  // intelligence
                80,  // stamina
                ctx
            );

            // Power formula: strength * 2 + agility + intelligence + stamina
            let expected_power = 100 * 2 + 50 + 30 + 80;
            assert!(battle::calculate_power(&nft) == expected_power, 0);

            transfer::public_transfer(nft, test_helpers::admin_address());
        };

        ts::end(scenario);
    }

    #[test]
    fun test_battle_experience_and_rewards() {
        let mut scenario = ts::begin(test_helpers::player1_address());
        let (mut arena, mut battle_obj, nft1, nft2) = test_helpers::setup_battle_scenario(&mut scenario, 100, 50);

        // Start battle
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            battle::start_battle(&mut battle_obj);
        };

        // Execute turn
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            battle::execute_turn(&mut arena, &mut battle_obj, &nft1, &nft2, ts::ctx(&mut scenario));
        };

        // Verify battle outcome
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            assert!(battle::is_finished(&battle_obj), 0);
            assert!(battle::get_winner(&battle_obj) == test_helpers::player1_address(), 1);

            let exp = battle::get_experience(&battle_obj);
            let reward = battle::get_reward(&battle_obj);

            // Experience should be positive and scale with power difference
            assert!(exp > 0, 2);
            assert!(exp <= 200, 3); // Max 2x base exp

            // Rewards should be within bounds
            assert!(reward >= 50, 4);  // MIN_REWARD
            assert!(reward <= 500, 5); // MAX_REWARD

            // Arena statistics should be updated
            assert!(battle::get_total_battles(&arena) == 1, 6);
            assert!(battle::get_total_rewards(&arena) == reward, 7);
        };

        test_helpers::cleanup_battle_scenario(&mut scenario, arena, battle_obj, nft1, nft2);
        ts::end(scenario);
    }

    #[test]
    fun test_battle_with_equal_power() {
        let mut scenario = ts::begin(test_helpers::player1_address());
        let (mut arena, mut battle_obj, nft1, nft2) = test_helpers::setup_battle_scenario(&mut scenario, 100, 100);

        // Start and execute battle
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            battle::start_battle(&mut battle_obj);
            battle::execute_turn(&mut arena, &mut battle_obj, &nft1, &nft2, ts::ctx(&mut scenario));
        };

        // Verify outcome
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            assert!(battle::is_finished(&battle_obj), 0);
            
            // With equal power, experience should be base amount
            let exp = battle::get_experience(&battle_obj);
            assert!(exp == 100, 1); // BASE_EXPERIENCE

            // Rewards should still be within bounds
            let reward = battle::get_reward(&battle_obj);
            assert!(reward >= 50, 2);  // MIN_REWARD
            assert!(reward <= 500, 3); // MAX_REWARD
        };

        test_helpers::cleanup_battle_scenario(&mut scenario, arena, battle_obj, nft1, nft2);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = battle::EInvalidBattle)]
    fun test_battle_invalid_start() {
        let mut scenario = ts::begin(test_helpers::player1_address());
        let (mut arena, mut battle_obj, nft1, nft2) = test_helpers::setup_battle_scenario(&mut scenario, 100, 50);

        // Try to execute turn without starting battle
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            battle::execute_turn(&mut arena, &mut battle_obj, &nft1, &nft2, ts::ctx(&mut scenario));
        };

        test_helpers::cleanup_battle_scenario(&mut scenario, arena, battle_obj, nft1, nft2);
        ts::end(scenario);
    }
} 