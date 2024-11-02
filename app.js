const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
const Category = require('./models/category');
const Product = require('./models/product');
const News = require('./models/News');
const Contact = require('./models/contact'); // Đường dẫn tương ứng với vị trí của file contact.js
const Cart = require('./models/cart'); // Đảm bảo import mô hình Cart
const cart = { items: [] }; // Giỏ hàng trong bộ nhớ
const cookieParser = require('cookie-parser');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const port = 8000;
// Middleware cho cookie-parser
app.use(cookieParser());
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key', // Thay thế bằng một khóa bí mật
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Nếu bạn sử dụng HTTPS, hãy đặt secure: true
}));

// Cấu hình multer để lưu trữ tệp
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Đường dẫn đến thư mục uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên tệp
    }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));


// Cấu hình view engine EJS và đường dẫn views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Cấu hình body-parser để xử lý dữ liệu từ form
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017/template', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Cấu hình để phục vụ các file tĩnh (CSS, JS, hình ảnh)
app.use(express.static(path.join(__dirname, 'public')));


// Route để hiển thị trang index.ejs từ thư mục giftos-html

app.get('/admin', (req, res) => {
    res.render('AdminLTE-master/index');  // render file index.ejs từ AdminLTE-master
});
app.get('/categories/add', (req, res) => {
    res.render('AdminLTE-master/category'); // Tạo mới category
});

app.post('/categories/add', async (req, res) => {
    try {
        const { name, description } = req.body;

        // Tạo mới category với dữ liệu từ form
        const category = new Category({ name, description });

        // Lưu category vào cơ sở dữ liệu
        await category.save();

        // Chuyển hướng về trang danh sách category sau khi thêm thành công
        res.redirect('/categories');
    } catch (error) {
        console.error('Error while adding category:', error);
        res.status(500).send('Server Error');
    }
});


app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render('AdminLTE-master/category-list', { categories });  // Hiển thị danh sách category
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/categories/edit/:id', async (req, res) => {
    try {
        // Tìm category dựa vào ID từ URL
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        
        // Render form sửa với thông tin category hiện tại
        res.render('AdminLTE-master/category-edit', { category });
    } catch (error) {
        console.error('Error while fetching category:', error);
        res.status(500).send('Server Error');
    }
});
// lenh xu ly category cap nhat lai vao database
app.post('/categories/edit/:id', async (req, res) => {
    try {
        const { name, description } = req.body;

        // Cập nhật category theo ID
        await Category.findByIdAndUpdate(req.params.id, { name, description });

        // Sau khi cập nhật thành công, chuyển hướng về trang danh sách category
        res.redirect('/categories');
    } catch (error) {
        console.error('Error while updating category:', error);
        res.status(500).send('Server Error');
    }
});
///lenh xoa category
app.get('/categories/delete/:id', async (req, res) => {
    try {
        // Xóa category theo ID
        await Category.findByIdAndDelete(req.params.id);

        // Sau khi xóa thành công, chuyển hướng về trang danh sách category
        res.redirect('/categories');
    } catch (error) {
        console.error('Error while deleting category:', error);
        res.status(500).send('Server Error');
    }
});

// API để lấy danh mục (Giả sử bạn đã có một route như thế này)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});



//hiện form product
app.get('/products/add', async (req, res) => {
    try {
        // Lấy danh sách category để hiển thị trong form
        const categories = await Category.find({});
        res.render('AdminLTE-master/product-add', { categories });
    } catch (error) {
        console.error('Error while fetching categories:', error);
        res.status(500).send('Server Error');
    }
});
// xử lí product

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({}).populate('category'); // Lấy sản phẩm và thông tin category liên quan
        res.status(200).json(products); // Trả về danh sách sản phẩm dưới dạng JSON
    } catch (error) {
        console.error('Error while fetching products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});





// Add Product Function
const addProduct = async (req, res) => {
    const { name, description, price, category } = req.body;

    try {
        // Create a new product instance
        const newProduct = new Product({
            name,
            description,
            price,
            category,
        });

        // Save the product to the database
        const savedProduct = await newProduct.save();

        return res.status(201).json({
            success: true,
            message: 'Product added successfully!',
            product: savedProduct,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding product!',
            error: error.message,
        });
    }
};

// Routes
app.post('/api/products/add', addProduct);


app.post('/products/add', upload.single('image'), async (req, res) => {
    const { name, description, price, category } = req.body;
    const imagePath = req.file ? req.file.path : ''; // Đường dẫn đến ảnh

    // Tạo sản phẩm mới
    const newProduct = new Product({
        name,
        description,
        price,
        category,
        image: imagePath,
    });

    try {
        // Lưu sản phẩm vào cơ sở dữ liệu
        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding product');
    }
});
//hiển thị product
app.get('/products', async (req, res) => {
    try {
        // Lấy tất cả sản phẩm và thông tin về category
        const products = await Product.find({}).populate('category');

        // Render view hiển thị danh sách sản phẩm
        res.render('AdminLTE-master/product-list', { products });
    } catch (error) {
        console.error('Error while fetching products:', error);
        res.status(500).send('Server Error');
    }
});
app.post('/products/edit/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const { name, price, description, image } = req.body;

        await Product.findByIdAndUpdate(productId, { name, price, description, image });
        res.redirect('/products'); // Chuyển hướng lại trang danh sách sản phẩm sau khi chỉnh sửa
    } catch (error) {
        console.error('Error editing product:', error);
        res.status(500).send('Error editing product');
    }
});

app.post('/products/delete/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        await Product.findByIdAndDelete(productId);
        res.redirect('/products'); // Sau khi xóa, chuyển hướng đến danh sách sản phẩm
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
});


// xóa sp
app.delete('/products/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting product' });
    }
});




app.get('/shop', async (req, res) => {
    try {
        const products = await Product.find().populate('category'); // Lấy tất cả sản phẩm từ database
        const username = req.session.username || null; // Lấy username từ session nếu đã đăng nhập
        res.render('giftos-html/shop', { products, username }); // Truyền sản phẩm và username vào view
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
});


// Route để hiển thị trang liên hệ (contact)
app.get('/contact', (req, res) => {
    const username = req.session.username || null; // Lấy username từ session nếu có
    res.render('giftos-html/contact', { username }); // Truyền username vào view
});


// Route để xử lý form liên hệ
app.post('/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    
    try {
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        res.status(201).send('Thông tin đã được gửi thành công.');
    } catch (error) {
        console.error('Có lỗi xảy ra khi lưu thông tin liên hệ:', error);
        res.status(500).send('Có lỗi xảy ra khi lưu thông tin liên hệ.');
    }
});






// Hiển thị danh sách tin tức
app.get('/admin/news', async (req, res) => {
    const newsList = await News.find();
    res.render('AdminLTE-master/news-index', { news: newsList });
});

// Thêm tin tức
app.get('/admin/news/add', (req, res) => {
    res.render('AdminLTE-master/news-add');
});

app.post('/admin/news/add', async (req, res) => {
   

    const { title, content } = req.body;
    const news = new News({ title, content });
    await news.save();
    res.redirect('/admin/news');
});

// Sửa tin tức
app.get('/admin/news/edit/:id', async (req, res) => {
    const news = await News.findById(req.params.id);
    res.render('AdminLTE-master/news-edit', { news });
});

app.post('/admin/news/edit/:id', async (req, res) => {
    const { title, content } = req.body;
    await News.findByIdAndUpdate(req.params.id, { title, content });
    res.redirect('/admin/news');
});

// Xóa tin tức
app.post('/admin/news/delete/:id', async (req, res) => {
    await News.findByIdAndDelete(req.params.id);
    res.redirect('/admin/news');
});


// Lấy tất cả bài viết tin tức cho người dùng
app.get('/news', async (req, res) => {

    try {
        const news = await News.find(); // Lấy tất cả tin tức từ cơ sở dữ liệu
        const username = req.session.username || null; // Lấy username từ session nếu có
        res.render('giftos-html/news', { news, username }); // Truyền dữ liệu news và username vào view
    } catch (err) {
        console.error(err);
        res.status(500).send('Có lỗi xảy ra khi lấy tin tức.');
    }
});

// Route để xem chi tiết tin tức
app.get('/news/:id', async (req, res) => {

    try {
        const newsItem = await News.findById(req.params.id); // Lấy tin tức theo ID
        if (!newsItem) {
            return res.status(404).send('Không tìm thấy bài viết.');
        }
        res.render('giftos-html/news-detail', { newsItem }); // Render view chi tiết
    } catch (err) {
        console.error(err);
        res.status(500).send('Có lỗi xảy ra khi lấy chi tiết bài viết.');
    }
});



// Route cho trang why.ejs
app.get('/why', (req, res) => {
    const username = req.session.username || null; // Lấy username từ session nếu có
    res.render('giftos-html/why', { username }); // Truyền username vào view
});




app.post('/cart/add/:productId', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    }

    const userId = req.session.userId;
    const productId = req.params.productId;
    const quantity = req.body.quantity ? parseInt(req.body.quantity) : 1;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            // Tạo giỏ hàng mới nếu chưa có
            cart = new Cart({
                userId,
                items: [{ productId, quantity }],
                total: product.price * quantity // Khởi tạo tổng giá trị
            });
        } else {
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const productIndex = cart.items.findIndex(p => p.productId.equals(productId));

            if (productIndex > -1) {
                // Nếu có, cập nhật số lượng sản phẩm
                cart.items[productIndex].quantity += quantity;
            } else {
                // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng
                cart.items.push({ productId, quantity });
            }
            // Cập nhật lại tổng giá trị
            cart.total += product.price * quantity;
        }

        await cart.save();
        res.redirect('/cart'); // Chuyển hướng đến trang giỏ hàng sau khi thêm
    } catch (error) {
        console.error('Error adding to cart:', error); // Ghi log lỗi chi tiết
        res.status(500).send('Error adding to cart');
    }
});



app.get('/cart', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const userId = req.session.userId;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        res.render('giftos-html/cart', { cart });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Error fetching cart');
    }
});






app.get('/shop', async (req, res) => {
    const products = await Product.find(); // Lấy danh sách sản phẩm từ MongoDB
    res.render('giftos-html/shop', { products }); // Truyền danh sách sản phẩm vào trang shop.ejs
});

// Route đăng ký
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body; // Nếu bạn có trường email

    try {
        // Kiểm tra tên đăng nhập đã tồn tại hay chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Tên đăng nhập đã tồn tại');
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();

        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        res.redirect('/login');
    } catch (error) {
        // In ra chi tiết lỗi để kiểm tra
        console.error('Lỗi chi tiết:', error);
        res.status(500).send('Có lỗi xảy ra trong quá trình đăng ký');
    }
});

// Route hiển thị trang đăng ký
app.get('/register', (req, res) => {
    res.render('giftos-html/register');
});
// đăng nhập
app.set('views', 'D:/teamplate/views');
app.get('/login', (req, res) => {
    res.render('giftos-html/login');
});
// Route xử lý đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Tìm người dùng theo tên đăng nhập
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // Lưu thông tin người dùng vào session
        req.session.userId = user._id;      // Lưu ID người dùng vào session
        req.session.username = user.username; // Lưu tên người dùng vào session

        // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
        res.redirect('/'); 
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Có lỗi xảy ra trong quá trình đăng nhập');
    }
});


// Route xử lý trang chủ
app.get('/', (req, res) => {
    const username = req.session.username; // Kiểm tra xem username đã có trong session hay chưa
    res.render('giftos-html/index', { username }); // Truyền username vào index.ejs
});

// Route đăng xuất
app.get('/logout', (req, res) => {
    req.session.destroy((err) => { // Xóa session đăng nhập
        if (err) {
            console.error('Lỗi khi đăng xuất:', err);
            return res.redirect('/'); // Chuyển hướng về trang chủ nếu có lỗi
        }
        res.redirect('/'); // Chuyển hướng về trang chủ sau khi đăng xuất
    });
});


app.get('/user', (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    }

    res.render('giftos-html/user', { username });
});



// Khởi động máy chủ
app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});
