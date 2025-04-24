#[test_only]
module ddc::marketplace_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin;

    use ddc::marketplace::{Self, Marketplace};
    use ddc::nft;
    use ddc::token::{Self, TOKEN};

    const SELLER: address = @0xA;
    const BUYER: address = @0xB;
    const NFT_PRICE: u64 = 100;

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(SELLER);
        
        // Initialize modules
        {
            let ctx = ts::ctx(&mut scenario);
            token::init_for_testing(ctx);
            nft::init_for_testing(ctx);
            marketplace::init_for_testing(ctx);
        };

        scenario
    }

    #[test]
    fun test_list_and_buy_nft() {
        let mut scenario = setup_test();
        let nft_id: object::ID;
        
        // Mint NFT and list it
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));
            nft_id = object::id(&nft);

            marketplace::list_nft(
                &mut marketplace,
                nft,
                NFT_PRICE,
                ts::ctx(&mut scenario)
            );

            let (seller, price) = marketplace::get_listing(&marketplace, nft_id);
            assert!(seller == SELLER, 0);
            assert!(price == NFT_PRICE, 1);

            ts::return_shared(marketplace);
        };

        // Mint tokens for buyer and buy NFT
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let payment = coin::mint_for_testing<TOKEN>(NFT_PRICE, ts::ctx(&mut scenario));

            let (nft, seller_payment, fee_payment, remaining_payment) = marketplace::buy_nft(
                &mut marketplace,
                nft_id,
                payment,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(nft, BUYER);
            transfer::public_transfer(seller_payment, SELLER);
            transfer::public_transfer(fee_payment, BUYER);
            transfer::public_transfer(remaining_payment, BUYER);

            let (total_listings, total_volume, fee_balance) = marketplace::get_marketplace_stats(&marketplace);
            assert!(total_listings == 0, 2);
            assert!(total_volume == NFT_PRICE, 3);
            assert!(fee_balance == NFT_PRICE * 25 / 1000, 4); // 2.5% fee

            ts::return_shared(marketplace);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_cancel_listing() {
        let mut scenario = setup_test();
        let nft_id: object::ID;
        
        // Mint and list NFT
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));
            nft_id = object::id(&nft);

            marketplace::list_nft(
                &mut marketplace,
                nft,
                NFT_PRICE,
                ts::ctx(&mut scenario)
            );

            let nft = marketplace::cancel_listing(
                &mut marketplace,
                nft_id,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(nft, SELLER);

            let (total_listings, total_volume, _) = marketplace::get_marketplace_stats(&marketplace);
            assert!(total_listings == 0, 0);
            assert!(total_volume == 0, 1);

            ts::return_shared(marketplace);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::E_INSUFFICIENT_PAYMENT)]
    fun test_insufficient_payment() {
        let mut scenario = setup_test();
        let nft_id: object::ID;
        
        // List NFT
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));
            nft_id = object::id(&nft);
            marketplace::list_nft(
                &mut marketplace,
                nft,
                NFT_PRICE,
                ts::ctx(&mut scenario)
            );
            ts::return_shared(marketplace);
        };

        // Try to buy with insufficient payment
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let payment = coin::mint_for_testing<TOKEN>(NFT_PRICE - 1, ts::ctx(&mut scenario));

            let (nft, seller_payment, fee_payment, remaining_payment) = marketplace::buy_nft(
                &mut marketplace,
                nft_id,
                payment,
                ts::ctx(&mut scenario)
            );

            // These lines won't execute due to expected failure
            transfer::public_transfer(nft, BUYER);
            transfer::public_transfer(seller_payment, SELLER);
            transfer::public_transfer(fee_payment, BUYER);
            transfer::public_transfer(remaining_payment, BUYER);

            ts::return_shared(marketplace);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::E_NOT_OWNER)]
    fun test_unauthorized_cancel() {
        let mut scenario = setup_test();
        let nft_id: object::ID;
        
        // List NFT
        ts::next_tx(&mut scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));
            nft_id = object::id(&nft);
            marketplace::list_nft(
                &mut marketplace,
                nft,
                NFT_PRICE,
                ts::ctx(&mut scenario)
            );
            ts::return_shared(marketplace);
        };

        // Try to cancel as non-owner
        ts::next_tx(&mut scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(&scenario);

            let nft = marketplace::cancel_listing(
                &mut marketplace,
                nft_id,
                ts::ctx(&mut scenario)
            );

            // This line won't execute due to expected failure
            transfer::public_transfer(nft, BUYER);

            ts::return_shared(marketplace);
        };

        ts::end(scenario);
    }
} 