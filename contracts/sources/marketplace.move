module ddc::marketplace {
    use sui::coin::{Self, Coin};
    use sui::table::{Self, Table};
    use sui::dynamic_field;
    use sui::event;

    use ddc::nft::GameNFT;
    use ddc::token::TOKEN;

    // Error codes
    const E_INVALID_PRICE: u64 = 0;
    const E_INSUFFICIENT_PAYMENT: u64 = 1;
    const E_LISTING_NOT_FOUND: u64 = 2;
    const E_NOT_OWNER: u64 = 3;

    // Fee percentage (2.5%)
    const FEE_PERCENTAGE: u64 = 25;
    const FEE_DENOMINATOR: u64 = 1000;

    public struct Marketplace has key, store {
        id: object::UID,
        listings: Table<object::ID, Listing>,
        total_listings: u64,
        total_volume: u64,
        fee_balance: u64,
    }

    public struct Listing has store, drop {
        seller: address,
        price: u64,
    }

    // Events
    public struct NFTListed has copy, drop {
        nft_id: object::ID,
        seller: address,
        price: u64,
    }

    public struct NFTSold has copy, drop {
        nft_id: object::ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    public struct ListingCancelled has copy, drop {
        nft_id: object::ID,
        seller: address,
    }

    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx),
            total_listings: 0,
            total_volume: 0,
            fee_balance: 0,
        };
        transfer::public_share_object(marketplace);
    }

    public fun list_nft(
        marketplace: &mut Marketplace,
        nft: GameNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, E_INVALID_PRICE);

        let nft_id = object::id(&nft);
        let seller = tx_context::sender(ctx);

        let listing = Listing {
            seller,
            price,
        };

        table::add(&mut marketplace.listings, nft_id, listing);
        marketplace.total_listings = marketplace.total_listings + 1;

        dynamic_field::add(&mut marketplace.id, nft_id, nft);

        event::emit(NFTListed {
            nft_id,
            seller,
            price,
        });
    }

    public fun buy_nft(
        marketplace: &mut Marketplace,
        nft_id: object::ID,
        mut payment: Coin<TOKEN>,
        ctx: &mut tx_context::TxContext
    ): (GameNFT, Coin<TOKEN>, Coin<TOKEN>, Coin<TOKEN>) {
        assert!(table::contains(&marketplace.listings, nft_id), E_LISTING_NOT_FOUND);
        let listing = table::borrow(&marketplace.listings, nft_id);
        let price = listing.price;
        
        assert!(coin::value(&payment) >= price, E_INSUFFICIENT_PAYMENT);

        let fee_amount = (price * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        let seller_amount = price - fee_amount;

        let fee_coin = coin::split(&mut payment, fee_amount, ctx);
        marketplace.fee_balance = marketplace.fee_balance + coin::value(&fee_coin);

        let seller_coin = coin::split(&mut payment, seller_amount, ctx);

        let nft = dynamic_field::remove<object::ID, GameNFT>(&mut marketplace.id, nft_id);

        let listing = table::remove(&mut marketplace.listings, nft_id);
        marketplace.total_listings = marketplace.total_listings - 1;
        marketplace.total_volume = marketplace.total_volume + listing.price;

        event::emit(NFTSold {
            nft_id,
            seller: listing.seller,
            buyer: tx_context::sender(ctx),
            price: listing.price,
        });

        (nft, seller_coin, fee_coin, payment)
    }

    public fun cancel_listing(
        marketplace: &mut Marketplace,
        nft_id: object::ID,
        ctx: &mut tx_context::TxContext
    ): GameNFT {
        assert!(table::contains(&marketplace.listings, nft_id), E_LISTING_NOT_FOUND);
        let listing = table::borrow(&marketplace.listings, nft_id);
        assert!(listing.seller == tx_context::sender(ctx), E_NOT_OWNER);

        let nft = dynamic_field::remove<object::ID, GameNFT>(&mut marketplace.id, nft_id);

        let listing = table::remove(&mut marketplace.listings, nft_id);
        marketplace.total_listings = marketplace.total_listings - 1;

        event::emit(ListingCancelled {
            nft_id,
            seller: listing.seller,
        });

        nft
    }

    // View functions
    public fun get_listing(marketplace: &Marketplace, nft_id: object::ID): (address, u64) {
        let listing = table::borrow(&marketplace.listings, nft_id);
        (listing.seller, listing.price)
    }

    public fun get_marketplace_stats(marketplace: &Marketplace): (u64, u64, u64) {
        (marketplace.total_listings, marketplace.total_volume, marketplace.fee_balance)
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
} 