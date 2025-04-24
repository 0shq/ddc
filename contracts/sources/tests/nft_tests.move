#[test_only]
module ddc::nft_tests {
    use sui::test_scenario as ts;
    use std::string;
    
    use ddc::nft;
    use ddc::test_helpers;

    const INVALID_ATTRIBUTE: u64 = 0;
    const VALID_ATTRIBUTE: u64 = 50;

    #[test]
    fun test_nft_creation() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        test_helpers::setup_game_env(&mut scenario);
        
        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            let nft = nft::create_test_nft(ts::ctx(&mut scenario));
            // Verify default attributes
            assert!(nft::get_strength(&nft) == 50, 0);
            assert!(nft::get_agility(&nft) == 50, 1);
            assert!(nft::get_intelligence(&nft) == 50, 2);
            assert!(nft::get_stamina(&nft) == 50, 3);
            assert!(nft::get_level(&nft) == 1, 4);
            assert!(*nft::get_name(&nft) == string::utf8(b"Test Character"), 5);
            
            // Transfer NFT to admin
            sui::transfer::public_transfer(nft, test_helpers::admin_address());
        };

        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            // Verify admin received the NFT
            let nft = ts::take_from_sender<nft::GameNFT>(&scenario);
            ts::return_to_sender(&scenario, nft);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_custom_nft_creation() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            let nft = nft::mint(
                string::utf8(b"Custom Character"),
                60,  // strength
                70,  // agility
                80,  // intelligence
                90,  // stamina
                ts::ctx(&mut scenario)
            );
            
            // Verify custom attributes
            assert!(nft::get_strength(&nft) == 60, 0);
            assert!(nft::get_agility(&nft) == 70, 1);
            assert!(nft::get_intelligence(&nft) == 80, 2);
            assert!(nft::get_stamina(&nft) == 90, 3);
            assert!(nft::get_level(&nft) == 1, 4);
            assert!(*nft::get_name(&nft) == string::utf8(b"Custom Character"), 5);
            
            sui::transfer::public_transfer(nft, test_helpers::admin_address());
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = nft::EInvalidAttribute)]
    fun test_invalid_attribute() {
        let mut scenario = ts::begin(test_helpers::admin_address());
        
        ts::next_tx(&mut scenario, test_helpers::admin_address());
        {
            let nft = nft::mint(
                string::utf8(b"Invalid Character"),
                INVALID_ATTRIBUTE,  // Invalid strength
                VALID_ATTRIBUTE,
                VALID_ATTRIBUTE,
                VALID_ATTRIBUTE,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_transfer(nft, test_helpers::admin_address());
        };
        
        ts::end(scenario);
    }
} 