#[test_only]
module ddc::game_tests {
    use sui::test_scenario as ts;
    use sui::coin;
    use sui::sui::SUI;
    
    use ddc::game::{Self, AdminCap, GameConfig};

    // Test addresses
    const ADMIN: address = @0xA;
    const PLAYER1: address = @0x1;

    #[test]
    fun test_init() {
        let mut scenario = ts::begin(ADMIN);
        {
            // Create admin cap and game config for testing
            let admin_cap = game::create_admin_cap_for_testing(ts::ctx(&mut scenario));
            let game_config = game::create_game_config_for_testing(ts::ctx(&mut scenario));

            // Transfer admin cap to ADMIN
            transfer::public_transfer(admin_cap, ADMIN);
            // Share game config
            transfer::public_share_object(game_config);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            // Verify admin cap was transferred to ADMIN
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            ts::return_to_sender(&scenario, admin_cap);

            // Verify game config was created with zero treasury
            let game_config = ts::take_shared<GameConfig>(&scenario);
            assert!(game::get_treasury_value(&game_config) == 0, 0);
            assert!(game::get_total_mints(&game_config) == 0, 1);
            ts::return_shared(game_config);
        };
        ts::end(scenario);
    }

    #[test]
    fun test_treasury_management() {
        let mut scenario = ts::begin(ADMIN);
        {
            // Create admin cap and game config for testing
            let admin_cap = game::create_admin_cap_for_testing(ts::ctx(&mut scenario));
            let game_config = game::create_game_config_for_testing(ts::ctx(&mut scenario));

            // Transfer admin cap to ADMIN
            transfer::public_transfer(admin_cap, ADMIN);
            // Share game config
            transfer::public_share_object(game_config);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            // Add funds to treasury
            let mut game_config = ts::take_shared<GameConfig>(&scenario);
            let coin = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
            game::add_to_treasury(&mut game_config, coin, ts::ctx(&mut scenario));
            assert!(game::get_treasury_value(&game_config) == 1000, 2);
            ts::return_shared(game_config);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            // Admin withdraws funds
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut game_config = ts::take_shared<GameConfig>(&scenario);

            game::admin_withdraw(&admin_cap, &mut game_config, 500, PLAYER1, ts::ctx(&mut scenario));
            assert!(game::get_treasury_value(&game_config) == 500, 3);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(game_config);
        };

        ts::next_tx(&mut scenario, PLAYER1);
        {
            // Verify PLAYER1 received the funds
            let coin = ts::take_from_sender<coin::Coin<SUI>>(&scenario);
            assert!(coin::value(&coin) == 500, 4);
            ts::return_to_sender(&scenario, coin);
        };
        ts::end(scenario);
    }
}
