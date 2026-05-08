export const ADMIN_ROLE = "SUPER_ADMIN";
export const USER_ROLE = "NORMAL_USER";

export const SAMPLE_CATEGORIES = [
    {
        name: 'Thiết bị điện tử',
        slug: 'electronics',
        description: 'Các sản phẩm điện tử, công nghệ hiện đại như điện thoại, laptop, máy tính bảng, phụ kiện công nghệ.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png',
        isActive: true,
    },
    {
        name: 'Thời trang & Phụ kiện',
        slug: 'fashion',
        description: 'Quần áo, giày dép, túi xách và các phụ kiện thời trang nam nữ cho mọi phong cách.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
        isActive: true,
    },
    {
        name: 'Nhà cửa & Đời sống',
        slug: 'home-living',
        description: 'Đồ gia dụng, nội thất, trang trí nhà cửa và các sản phẩm phục vụ đời sống hằng ngày.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/1940/1940922.png',
        isActive: true,
    },
    {
        name: 'Sức khỏe & Làm đẹp',
        slug: 'health-beauty',
        description: 'Mỹ phẩm, chăm sóc da, thực phẩm chức năng và các sản phẩm chăm sóc sức khỏe làm đẹp.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
        isActive: true,
    },
    {
        name: 'Thể thao & Dã ngoại',
        slug: 'sports-outdoors',
        description: 'Dụng cụ thể thao, đồ dã ngoại, trang phục tập luyện và các thiết bị hoạt động ngoài trời.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/857/857441.png',
        isActive: true,
    },
    {
        name: 'Sách & Văn phòng phẩm',
        slug: 'books',
        description: 'Sách giáo khoa, sách văn học, truyện tranh, văn phòng phẩm và dụng cụ học tập.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/2702/2702134.png',
        isActive: true,
    },
    {
        name: 'Bách hóa & Thực phẩm',
        slug: 'groceries',
        description: 'Thực phẩm tươi sống, đồ khô, đồ uống, gia vị và các mặt hàng bách hóa thiết yếu hằng ngày.',
        thumbnail: 'https://cdn-icons-png.flaticon.com/512/3724/3724788.png',
        isActive: true,
    },
]

export const SAMPLE_PRODUCTS = [
    // 1. Thiết bị điện tử (electronics)
    {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        short_description: 'Siêu phẩm mới nhất từ Apple với chip A17 Pro mạnh mẽ.',
        long_description: '<p>iPhone 15 Pro Max là chiếc iPhone đầu tiên sử dụng thiết kế titan hàng không vũ trụ.</p>',
        price: 34990000,
        stock_quantity: 50,
        category_slug: 'electronics',
        images: [
            'https://apple.ngocnguyen.vn/cdn/images/202409/goods_img/iphone-15-pro-max-chinh-hang--like-new-99-G15597-1726997326183.png',
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
        ],
        averageRating: 5,
        totalReviews: 120,
    },
    {
        name: 'Laptop Gaming ASUS ROG Zephyrus G14',
        slug: 'laptop-gaming-asus-rog-zephyrus-g14',
        short_description: 'Laptop gaming 14 inch mạnh mẽ nhất thế giới.',
        long_description: '<p>Sức mạnh đỉnh cao trong thiết kế nhỏ gọn.</p>',
        price: 45000000,
        stock_quantity: 15,
        category_slug: 'electronics',
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
            'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_3__7_155.png'
        ],
        averageRating: 4.8,
        totalReviews: 45,
    },
    {
        name: 'Tai nghe Sony WH-1000XM5',
        slug: 'tai-nghe-sony-wh-1000xm5',
        short_description: 'Tai nghe chống ồn hàng đầu thế giới.',
        long_description: '<p>Trải nghiệm âm thanh tinh khiết với công nghệ chống ồn tiên tiến.</p>',
        price: 7990000,
        stock_quantity: 30,
        category_slug: 'electronics',
        images: [
            'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
        ],
        averageRating: 4.9,
        totalReviews: 89,
    },
    {
        name: 'Chuột Logitech MX Master 3S',
        slug: 'chuot-logitech-mx-master-3s',
        short_description: 'Chuột không dây cao cấp dành cho công việc.',
        long_description: '<p>Độ chính xác cực cao, hoạt động mượt mà trên mọi bề mặt.</p>',
        price: 2490000,
        stock_quantity: 100,
        category_slug: 'electronics',
        images: [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800'
        ],
        averageRating: 4.7,
        totalReviews: 210,
    },

    // 2. Thời trang & Phụ kiện (fashion)
    {
        name: 'Áo Thun Nam Cotton 100% Premium',
        slug: 'ao-thun-nam-cotton-100-premium',
        short_description: 'Áo thun basic, thoáng mát, thấm hút mồ hôi tốt.',
        long_description: '<p>Chất liệu cotton tự nhiên, bền màu, không xù lông.</p>',
        price: 250000,
        stock_quantity: 500,
        category_slug: 'fashion',
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800',
            'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800'
        ],
        averageRating: 4.5,
        totalReviews: 1500,
    },
    {
        name: 'Giày Sneaker Nike Air Force 1',
        slug: 'giay-sneaker-nike-air-force-1',
        short_description: 'Biểu tượng thời trang đường phố.',
        long_description: '<p>Thiết kế cổ điển, màu trắng tinh khôi.</p>',
        price: 2900000,
        stock_quantity: 80,
        category_slug: 'fashion',
        images: [
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
            'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800'
        ],
        averageRating: 4.9,
        totalReviews: 3200,
    },
    {
        name: 'Túi Xách Nữ Thời Trang Canvas',
        slug: 'tui-xach-nu-thoi-trang-canvas',
        short_description: 'Túi tote canvas bền đẹp, dung tích lớn.',
        long_description: '<p>Phù hợp đi học, đi làm hoặc đi chơi.</p>',
        price: 150000,
        stock_quantity: 200,
        category_slug: 'fashion',
        images: [
            'https://images.unsplash.com/photo-1574365569389-a10d488ca3fb?q=80&w=800',
            'https://plus.unsplash.com/premium_photo-1681498942780-18f9071ca2c7?q=80&w=800'
        ],
        averageRating: 4.3,
        totalReviews: 450,
    },
    {
        name: 'Quần Jean Nam Ống Đứng',
        slug: 'quan-jean-nam-ong-dung',
        short_description: 'Chất jean co giãn thoải mái, form chuẩn.',
        long_description: '<p>Quần jean cao cấp, không ra màu.</p>',
        price: 450000,
        stock_quantity: 150,
        category_slug: 'fashion',
        images: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800'
        ],
        averageRating: 4.6,
        totalReviews: 780,
    },

    // 3. Nhà cửa & Đời sống (home-living)
    {
        name: 'Bộ Nồi Inox 304 Cao Cấp',
        slug: 'bo-noi-inox-304-cao-cap',
        short_description: 'Dùng được cho mọi loại bếp, kể cả bếp từ.',
        long_description: '<p>Chất liệu inox an toàn cho sức khỏe.</p>',
        price: 1200000,
        stock_quantity: 40,
        category_slug: 'home-living',
        images: [
            'https://bizweb.dktcdn.net/100/427/122/products/bo-noi-inox-lien-khoi-kazler-kalpen-1.jpg?v=1775464553063',
            'https://sanhangre.net/image/cache/catalog/2023-san-pham/kalpen-lermat-l2/bo-noi-inox-304-cao-cap-5-day-kalpen-lermat-l2-shr-1000x1000.jpg'
        ],
        averageRating: 4.7,
        totalReviews: 120,
    },
    {
        name: 'Robot Hút Bụi Xiaomi Vacuum Mop 2',
        slug: 'robot-hut-bui-xiaomi-vacuum-mop-2',
        short_description: 'Hút bụi và lau nhà thông minh.',
        long_description: '<p>Lực hút mạnh, cảm biến va chạm.</p>',
        price: 5500000,
        stock_quantity: 25,
        category_slug: 'home-living',
        images: [
            'https://product.hstatic.net/200000574527/product/robot-hut-bui-xiaomi-vaccum-mop-2-pro_3f8efa433d744e9eb9e2b46e1bfc50d3.jpg',
            'https://cdn.tgdd.vn/Products/Images/10139/271720/271720-600x600-1.jpg'
        ],
        averageRating: 4.8,
        totalReviews: 65,
    },
    {
        name: 'Đèn Bàn Học Chống Cận LED',
        slug: 'den-ban-hoc-chong-can-led',
        short_description: 'Ánh sáng tự nhiên, không gây mỏi mắt.',
        long_description: '<p>Nhiều chế độ sáng, tích hợp sạc không dây.</p>',
        price: 350000,
        stock_quantity: 120,
        category_slug: 'home-living',
        images: [
            'https://static.rangdongstore.vn/product/den-ban/RD-RL-01.V2/RD-RL-27.V2-1.jpg?fm=webp&w=500',
            'https://static.rangdongstore.vn/product/den-ban/RD-RL-26/RD-RL-26.LED-1.jpg?fm=webp&w=500'
        ],
        averageRating: 4.5,
        totalReviews: 310,
    },

    // 4. Sức khỏe & Làm đẹp (health-beauty)
    {
        name: 'Sữa Rửa Mặt La Roche-Posay Effaclar',
        slug: 'sua-rua-mat-la-roche-posay-effaclar',
        short_description: 'Dành cho da dầu và da nhạy cảm.',
        long_description: '<p>Làm sạch sâu, loại bỏ bã nhờn.</p>',
        price: 385000,
        stock_quantity: 300,
        category_slug: 'health-beauty',
        images: [
            'https://www.guardian.com.vn/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/l/r/lrp_v4rdyieosofvjel6.png',
            'https://product.hstatic.net/200000117693/product/3337872411991-1_042d6dc1d9d94f758d2b83c91af17b09_master.jpg'
        ],
        averageRating: 4.9,
        totalReviews: 5600,
    },
    {
        name: 'Kem Chống Nắng Anessa Perfect UV',
        slug: 'kem-chong-nang-anessa-perfect-uv',
        short_description: 'Chống nắng tối ưu, kháng nước mạnh mẽ.',
        long_description: '<p>Công nghệ Aqua Booster bền vững hơn khi tiếp xúc với nước.</p>',
        price: 520000,
        stock_quantity: 150,
        category_slug: 'health-beauty',
        images: [
            'https://image.hsv-tech.io/1987x0/bbx/sua-chong-nang-anessa-perfect-uv-sunscreen-skincare-milk-60ml_3ee021ee589048ecbb5d8cf98ff2f202.jpg',
            'https://image.hsv-tech.io/1987x0/bbx/products/be4afc0d-8526-492d-84d8-b4357c82d911.webp'
        ],
        averageRating: 4.8,
        totalReviews: 2300,
    },
    {
        name: 'Son Lì 3CE Velvet Lip Tint',
        slug: 'son-li-3ce-velvet-lip-tint',
        short_description: 'Bảng màu đa dạng, chất son mịn mượt.',
        long_description: '<p>Son kem lì nổi tiếng từ Hàn Quốc.</p>',
        price: 280000,
        stock_quantity: 400,
        category_slug: 'health-beauty',
        images: [
            'https://image.hsv-tech.io/1987x0/bbx/products/b06abb3b-79ed-4484-897a-e55b4394a48c.webp',
            'https://mint07.com/wp-content/uploads/2019/04/son-kem-3ce-velvet-lip-tint.png'
        ],
        averageRating: 4.6,
        totalReviews: 1800,
    },

    // 5. Thể thao & Dã ngoại (sports-outdoors)
    {
        name: 'Thảm Tập Yoga TPE 2 Lớp',
        slug: 'tham-tap-yoga-tpe-2-lop',
        short_description: 'Chống trơn trượt, êm ái khi tập luyện.',
        long_description: '<p>Chất liệu TPE thân thiện môi trường.</p>',
        price: 180000,
        stock_quantity: 100,
        category_slug: 'sports-outdoors',
        images: [
            'https://down-vn.img.susercontent.com/file/b4fedd4a7e16e9e93c0787a3fbaccbab',
            'https://thethaokhoe.vn/wp-content/uploads/2019/07/tham-yoga-2-lop-TPE-510x424.jpg'
        ],
        averageRating: 4.4,
        totalReviews: 890,
    },
    {
        name: 'Bình Nước Thể Thao 2L',
        slug: 'binh-nuoc-the-thao-2l',
        short_description: 'Nhắc nhở uống nước mỗi ngày.',
        long_description: '<p>Có vạch chia thời gian, ống hút tiện lợi.</p>',
        price: 85000,
        stock_quantity: 500,
        category_slug: 'sports-outdoors',
        images: [
            'https://salt.tikicdn.com/cache/200x280/ts/product/01/05/7e/f75b1f565ed44440a38c2df3d93da25b.jpg',
            'https://salt.tikicdn.com/cache/200x280/ts/product/64/77/88/b8c96eb8e55802d5c520fff5a20f7936.jpg'
        ],
        averageRating: 4.7,
        totalReviews: 1200,
    },
    {
        name: 'Vợt Cầu Lông Yonex Astrox 88D',
        slug: 'vot-cau-long-yonex-astrox-88d',
        short_description: 'Vợt tấn công mạnh mẽ.',
        long_description: '<p>Phù hợp cho người chơi chuyên nghiệp.</p>',
        price: 3200000,
        stock_quantity: 20,
        category_slug: 'sports-outdoors',
        images: [
            'https://us.yonex.com/cdn/shop/files/3ax88d-p_076-1_02.png?v=1738288177&width=1445',
            'https://us.yonex.com/cdn/shop/files/3AX88D-P_Black_Silver_2.jpg?v=1740597381&width=1445'
        ],
        averageRating: 4.9,
        totalReviews: 56,
    },

    // 6. Sách & Văn phòng phẩm (books)
    {
        name: 'Sách Đắc Nhân Tâm (Bìa Cứng)',
        slug: 'sach-dac-nhan-tam-bia-cung',
        short_description: 'Cuốn sách thay đổi cuộc đời hàng triệu người.',
        long_description: '<p>Kinh điển về nghệ thuật giao tiếp và ứng xử.</p>',
        price: 120000,
        stock_quantity: 1000,
        category_slug: 'books',
        images: [
            'https://pos.nvncdn.com/fd5775-40602/ps/20240406_eLnSJ8HdxS.jpeg?v=1712376790',
            'https://www.netabooks.vn/Data/Sites/1/Product/72168/thumbs/dac-nhan-tam-how-to-win-friends-and-influence-people.jpg'
        ],
        averageRating: 5,
        totalReviews: 4500,
    },
    {
        name: 'Bộ 12 Bút Bi Thiên Long',
        slug: 'bo-12-but-bi-thien-long',
        short_description: 'Bút viết trơn, mực đều.',
        long_description: '<p>Sản phẩm văn phòng phẩm quốc dân.</p>',
        price: 45000,
        stock_quantity: 2000,
        category_slug: 'books',
        images: [
            'https://product.hstatic.net/1000362139/product/b081_170d008b69b846be9084979d661d9e3b.jpg',
            'https://product.hstatic.net/1000362139/product/b083_34be19c733c247569b59e5522d314c07_small.jpg'
        ],
        averageRating: 4.8,
        totalReviews: 12000,
    },
    {
        name: 'Sổ Tay Lò Xo A5',
        slug: 'so-tay-lo-xo-a5',
        short_description: 'Giấy định lượng cao, chống lem mực.',
        long_description: '<p>Thiết kế trẻ trung, phù hợp ghi chép.</p>',
        price: 35000,
        stock_quantity: 600,
        category_slug: 'books',
        images: [
            'https://inminhkhoi.com.vn/wp-content/uploads/2024/10/in-so-tay-lo-xo-a5-200-trang-bia-cung-1-510x510.jpg',
            'https://inminhkhoi.com.vn/wp-content/uploads/2024/10/in-so-tay-lo-xo-a5-200-trang-bia-cung-2-510x510.jpg'
        ],
        averageRating: 4.5,
        totalReviews: 780,
    },

    // 7. Bách hóa & Thực phẩm (groceries)
    {
        name: 'Gạo Tám Thơm Điện Biên 5kg',
        slug: 'gao-tam-thom-dien-bien-5kg',
        short_description: 'Gạo dẻo, thơm đặc trưng.',
        long_description: '<p>Đặc sản Tây Bắc, hạt gạo trắng ngần.</p>',
        price: 155000,
        stock_quantity: 100,
        category_slug: 'groceries',
        images: [
            'https://www.lottemart.vn/media/catalog/product/cache/0x0/8/9/8936096740150.jpg.webp',
            'https://bizweb.dktcdn.net/thumb/grande/100/533/040/products/11.png?v=1734495923433'
        ],
        averageRating: 4.9,
        totalReviews: 560,
    },
    {
        name: 'Dầu Ăn Neptune Light 2L',
        slug: 'dau-an-neptune-light-2l',
        short_description: 'Dầu ăn cao cấp, tốt cho tim mạch.',
        long_description: '<p>Sự kết hợp hoàn hảo từ 3 loại dầu tự nhiên.</p>',
        price: 115000,
        stock_quantity: 300,
        category_slug: 'groceries',
        images: [
            'https://cdn.lottemart.vn/media/description/product/cache/8934988012033-DT-4.png.webp',
            'https://salt.tikicdn.com/cache/200x280/ts/product/ee/c9/07/2a3f0b725d5d3dfc28bd35dd3efbe476.jpg'
        ],
        averageRating: 4.8,
        totalReviews: 1100,
    },
    {
        name: 'Thùng 24 Lon Coca Cola 320ml',
        slug: 'thung-24-lon-coca-cola-320ml',
        short_description: 'Nước giải khát có gas hương cola truyền thống.',
        long_description: '<p>Sản phẩm không thể thiếu trong các bữa tiệc.</p>',
        price: 210000,
        stock_quantity: 80,
        category_slug: 'groceries',
        images: [
            'https://cdnv2.tgdd.vn/bhx-static/bhx/production/2026/2/image/Products/Images/2443/87880/bhx/nuoc-ngot-coke-sleek-330ml-thung-24-lon_202602241350447255.jpg'
        ],
        averageRating: 4.7,
        totalReviews: 890,
    },

    // Thêm các sản phẩm khác
    {
        name: 'Máy Ảnh Mirrorless Sony A7 IV',
        slug: 'may-anh-mirrorless-sony-a7-iv',
        short_description: 'Máy ảnh fullframe chuyên nghiệp.',
        long_description: '<p>Cảm biến 33MP, lấy nét tự động thời gian thực.</p>',
        price: 58000000,
        stock_quantity: 10,
        category_slug: 'electronics',
        images: [
            'https://pos.nvncdn.com/9af890-179840/ps/20211025_WlayFjIbZYkm544DuGjnrf1W.jpg?v=1673579715'
        ],
        averageRating: 5,
        totalReviews: 25,
    },
    {
        name: 'Áo Khoác Gió Uniqlo',
        slug: 'ao-khoac-gio-uniqlo',
        short_description: 'Mỏng nhẹ, chống tia UV.',
        long_description: '<p>Công nghệ chống nắng vượt trội.</p>',
        price: 650000,
        stock_quantity: 100,
        category_slug: 'fashion',
        images: [
            'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/474175/sub/goods_474175_sub14_3x4.jpg?width=600',
            'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/474175/feature/vngoods_474175_feature7.jpg?width=200'
        ],
        averageRating: 4.8,
        totalReviews: 420,
    },
    {
        name: 'Nồi Chiên Không Dầu Philips HD9270',
        slug: 'noi-chien-khong-dau-philips-hd9270',
        short_description: 'Dung tích XL cho cả gia đình.',
        long_description: '<p>Công nghệ Rapid Air độc đáo.</p>',
        price: 3200000,
        stock_quantity: 30,
        category_slug: 'home-living',
        images: [
            'https://www.domesticappliances.philips.co.in/cdn/shop/files/HD9270-70_1_5474fbe3-98c1-49e1-9761-7c281e545c3f.png?v=1756195452&width=720',
            'https://www.domesticappliances.philips.co.in/cdn/shop/files/HD9270-70_2_91c1cf89-1243-42c3-b11c-6c0712a1c8ac.png?v=1769584643&width=720'
        ],
        averageRating: 4.9,
        totalReviews: 156,
    },
    {
        name: 'Máy Tăm Nước Panasonic EW1511',
        slug: 'may-tam-nuoc-panasonic-ew1511',
        short_description: 'Vệ sinh răng miệng hiệu quả.',
        long_description: '<p>Công nghệ siêu âm giúp làm sạch mảng bám.</p>',
        price: 2450000,
        stock_quantity: 60,
        category_slug: 'health-beauty',
        images: [
            'https://shop.panasonic.com/cdn/shop/files/23-0091_ORC_shopPana_maincarousel_2048x2048_EW1511W.jpg?v=1692221379&width=2048',
            'https://shop.panasonic.com/cdn/shop/files/EW1511W_MAIN.jpg?v=1699880456&width=1500'
        ],
        averageRating: 4.7,
        totalReviews: 210,
    },
    {
        name: 'Giày Chạy Bộ Adidas Ultraboost Light',
        slug: 'giay-chay-bo-adidas-ultraboost-light',
        short_description: 'Êm ái và nhẹ nhàng trên từng bước chạy.',
        long_description: '<p>Phiên bản Ultraboost nhẹ nhất từ trước đến nay.</p>',
        price: 4500000,
        stock_quantity: 45,
        category_slug: 'sports-outdoors',
        images: [
            'https://assets.adidas.com/images/w_600%2Cf_auto%2Cq_auto/482ecabc04b44511a431fbeefae1dfd7_9366/Giay_Ultraboost_Light_trang_IE5828_HM1.jpg',
            'https://assets.adidas.com/images/h_2000%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/245bd48d531d42c599205c0be9e0dd64_9366/Giay_Ultraboost_Light_trang_IE5828_HM3_hover.jpg'
        ],
        averageRating: 4.9,
        totalReviews: 135,
    },
    {
        name: 'Bộ 24 Bút Màu Marker 2 Đầu',
        slug: 'bo-24-but-mau-marker-2-dau',
        short_description: 'Màu sắc rực rỡ, dễ phối màu.',
        long_description: '<p>Thích hợp cho các bạn yêu thích hội họa.</p>',
        price: 185000,
        stock_quantity: 120,
        category_slug: 'books',
        images: [
            'https://cdn1.fahasa.com/media/catalog/product/6/9/6941798484068.jpg',
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpaxprt0aijf51"
        ],
        averageRating: 4.6,
        totalReviews: 430,
    },
    {
        name: 'Hộp Quà Bánh Quy Danisa 908g',
        slug: 'hop-qua-banh-quy-danisa-908g',
        short_description: 'Bánh quy bơ truyền thống Đan Mạch.',
        long_description: '<p>Hương vị thơm ngon, sang trọng.</p>',
        price: 225000,
        stock_quantity: 50,
        category_slug: 'groceries',
        images: [
            'https://bizweb.dktcdn.net/thumb/1024x1024/100/438/624/products/banhdanisa908gnew.jpg?v=1670669077190',
            'https://banhtrungthu.org/wp-content/uploads/2023/11/banh-quy-bo-danisa-hop-thiec-908g-2.jpg'
        ],
        averageRating: 4.8,
        totalReviews: 720,
    },
    {
        name: 'Bút Cảm Ứng Chuyên Dụng Cho Mọi Dòng Máy Điện Thoại / Máy Tính Bảng Dễ Thương',
        slug: 'but-cam-ung-chuyen-dung-cho-moi-dong-may-dien-thoai-may-tinh-bang-de-thuong',
        short_description: 'Bút cảm ứng chuyên dụng cho mọi dòng máy điện thoại / máy tính bảng dễ thương.',
        long_description: '<p>Bút cảm ứng chuyên dụng cho mọi dòng máy điện thoại / máy tính bảng dễ thương.</p>',
        price: 25000,
        stock_quantity: 50,
        category_slug: 'electronics',
        images: [
            'https://thuonggiado.vn/uploads/product/2015/7WEE-but-cam-ung-dien-dung-dau-but-20mm-cho-d.webp',
            'https://thuonggiado.vn/uploads/product/2015/7WEE-7WEE-but-cam-ung-dien-dung-dau-but-20mm-cho-d-nib2..0.webp'
        ],
        averageRating: 4.4,
        totalReviews: 32,
    }
]

