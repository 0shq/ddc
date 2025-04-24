#[test_only]
module ddc::token_tests {
    use sui::test_scenario as ts;
    use sui::coin::{Self, Coin};
    use ddc::token::{Self, TokenAdmin, TOKEN};
    use ddc::test_helpers;

    #[test]
    fun test_token_initialization() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        // Initialize token module
        {
            token::init_for_testing(ts::ctx(&mut scenario));
        };

        // Verify admin received the TokenAdmin capability
        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            assert!(ts::has_most_recent_for_address<TokenAdmin>(test_helpers::admin_address()), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_token_minting() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        // Initialize token module
        {
            token::init_for_testing(ts::ctx(&mut scenario));
        };

        // Mint tokens
        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            let mut admin = ts::take_from_address<TokenAdmin>(&scenario, test_helpers::admin_address());
            let amount = 1000;
            
            token::mint(&mut admin, amount, test_helpers::player1_address(), ts::ctx(&mut scenario));
            assert!(token::total_supply(&admin) == amount, 0);
            
            ts::return_to_address(test_helpers::admin_address(), admin);
        };

        // Verify player received tokens
        ts::next_tx(&mut scenario, test_helpers::player1_address());
        {
            let coin = ts::take_from_address<Coin<TOKEN>>(&scenario, test_helpers::player1_address());
            assert!(coin::value(&coin) == 1000, 1);
            ts::return_to_address(test_helpers::player1_address(), coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_token_burning() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        // Initialize token module
        {
            token::init_for_testing(ts::ctx(&mut scenario));
        };

        // Mint and burn tokens
        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            let mut admin = ts::take_from_address<TokenAdmin>(&scenario, test_helpers::admin_address());
            let amount = 1000;
            
            // Mint tokens
            let coin = token::mint_for_testing(&mut admin, amount, ts::ctx(&mut scenario));
            assert!(token::total_supply(&admin) == amount, 0);
            
            // Burn tokens
            let burned_amount = token::burn(&mut admin, coin);
            assert!(burned_amount == amount, 1);
            assert!(token::total_supply(&admin) == 0, 2);
            
            ts::return_to_address(test_helpers::admin_address(), admin);
        };

        ts::end(scenario);
    }
} 