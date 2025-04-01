#[test_only]
module ddc::game_tests {
    use sui::test_utils::assert_eq;    
    use sui::test_scenario::{Self as ts};
    use sui::object;
    use ddc::game::{Self, NFT, BattleResult};
   
    #[test]
    fun test_mint_nft() {
        let admin = @0xA;
        let scenario = ts::begin(admin);
        
        // First transaction: Mint NFT
        ts::next_tx(&mut scenario, admin);
        {
            let name = b"Test NFT";
            let description = b"Test Description";
            let image_url = b"https://test.com/image.png";
            let rarity = 1;
            game::mint_nft(name, description, image_url, rarity, ts::ctx(&mut scenario));
        };
        
        // Second transaction: Check NFT attributes
        ts::next_tx(&mut scenario, admin);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            assert_eq(game::get_owner(&nft), admin);
            assert_eq(game::get_rarity(&nft), 1);
            ts::return_to_sender(&scenario, nft);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_battle() {
        let admin = @0xA;
        let scenario = ts::begin(admin);
        
        // First transaction: Mint first NFT
        ts::next_tx(&mut scenario, admin);
        {
            let name = b"NFT 1";
            let description = b"Test Description";
            let image_url = b"https://test.com/image.png";
            let rarity = 1;
            game::mint_nft(name, description, image_url, rarity, ts::ctx(&mut scenario));
        };
        
        // Second transaction: Mint second NFT
        ts::next_tx(&mut scenario, admin);
        {
            let name = b"NFT 2";
            let description = b"Test Description";
            let image_url = b"https://test.com/image.png";
            let rarity = 1;
            game::mint_nft(name, description, image_url, rarity, ts::ctx(&mut scenario));
        };
        
        // Third transaction: Battle NFTs
        ts::next_tx(&mut scenario, admin);
        {
            let nft1 = ts::take_from_sender<NFT>(&scenario);
            let nft2 = ts::take_from_sender<NFT>(&scenario);
            
            game::initiate_battle(&mut nft1, &mut nft2, ts::ctx(&mut scenario));
            
            ts::return_to_sender(&scenario, nft1);
            ts::return_to_sender(&scenario, nft2);
        };
        
        // Fourth transaction: Check battle results
        ts::next_tx(&mut scenario, admin);
        {
            let battle_result = ts::take_from_sender<BattleResult>(&scenario);
            let nft1 = ts::take_from_sender<NFT>(&scenario);
            let nft2 = ts::take_from_sender<NFT>(&scenario);
            
            let winner_id = game::get_winner(&battle_result);
            let exp_gained = game::get_experience_gained(&battle_result);
            
            assert!(
                winner_id == object::id(&nft1) || 
                winner_id == object::id(&nft2), 
                0
            );
            
            assert!(exp_gained > 0, 1);
            
            ts::return_to_sender(&scenario, battle_result);
            ts::return_to_sender(&scenario, nft1);
            ts::return_to_sender(&scenario, nft2);
        };
        
        ts::end(scenario);
    }
}