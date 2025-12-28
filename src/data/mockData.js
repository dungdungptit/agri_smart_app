// Mock data for AgriApp - Điện Biên Province
// Focus: Cà phê (Coffee) & Mắc ca (Macadamia)

// Điện Biên districts
export const provinces = [
    { id: '1', name: 'TP. Điện Biên Phủ', region: 'Tây Bắc Bộ' },
    { id: '2', name: 'Thị xã Mường Lay', region: 'Tây Bắc Bộ' },
    { id: '3', name: 'Mường Nhé', region: 'Tây Bắc Bộ' },
    { id: '4', name: 'Mường Chà', region: 'Tây Bắc Bộ' },
    { id: '5', name: 'Tủa Chùa', region: 'Tây Bắc Bộ' },
    { id: '6', name: 'Tuần Giáo', region: 'Tây Bắc Bộ' },
    { id: '7', name: 'Điện Biên', region: 'Tây Bắc Bộ' },
    { id: '8', name: 'Điện Biên Đông', region: 'Tây Bắc Bộ' },
    { id: '9', name: 'Mường Ảng', region: 'Tây Bắc Bộ' },
    { id: '10', name: 'Nậm Pồ', region: 'Tây Bắc Bộ' },
];

// Crops - Focus on Coffee & Macadamia
export const crops = [
    { id: '1', name: 'Cà phê Arabica', icon: '☕', category: 'Công nghiệp' },
    { id: '2', name: 'Mắc ca', icon: '🌰', category: 'Công nghiệp' },
    { id: '3', name: 'Cà phê Robusta', icon: '☕', category: 'Công nghiệp' },
    { id: '4', name: 'Chè Shan Tuyết', icon: '🌱', category: 'Công nghiệp' },
    { id: '5', name: 'Lúa nương', icon: '🌾', category: 'Lương thực' },
    { id: '6', name: 'Ngô', icon: '🌾', category: 'Lương thực' },
];

// Weather mock data - Điện Biên (mountain climate)
export const currentWeather = {
    location: 'Điện Biên Phủ',
    temperature: 18,
    feelsLike: 16,
    humidity: 75,
    windSpeed: 8,
    uvIndex: 5,
    condition: 'Có mây',
    icon: 'partly-cloudy',
    precipitation: 30,
    sunrise: '06:15',
    sunset: '17:45',
};

export const hourlyForecast = [
    { time: '06:00', temp: 12, icon: 'cloudy', precipitation: 10 },
    { time: '09:00', temp: 16, icon: 'partly-cloudy', precipitation: 10 },
    { time: '12:00', temp: 20, icon: 'sunny', precipitation: 5 },
    { time: '15:00', temp: 22, icon: 'partly-cloudy', precipitation: 20 },
    { time: '18:00', temp: 17, icon: 'cloudy', precipitation: 40 },
    { time: '21:00', temp: 14, icon: 'cloudy', precipitation: 30 },
    { time: '00:00', temp: 11, icon: 'cloudy', precipitation: 20 },
];

export const weeklyForecast = [
    { day: 'Hôm nay', high: 22, low: 11, icon: 'partly-cloudy', precipitation: 30 },
    { day: 'Thứ 5', high: 21, low: 10, icon: 'rainy', precipitation: 60 },
    { day: 'Thứ 6', high: 19, low: 9, icon: 'rainy', precipitation: 70 },
    { day: 'Thứ 7', high: 20, low: 10, icon: 'cloudy', precipitation: 40 },
    { day: 'CN', high: 23, low: 12, icon: 'sunny', precipitation: 10 },
    { day: 'Thứ 2', high: 24, low: 13, icon: 'sunny', precipitation: 5 },
    { day: 'Thứ 3', high: 25, low: 14, icon: 'partly-cloudy', precipitation: 15 },
];

// Pest & Disease data - Coffee & Macadamia focused
export const pests = [
    {
        id: '1',
        name: 'Bệnh gỉ sắt',
        crop: 'Cà phê',
        severity: 'high',
        image: null,
        symptoms: 'Mặt dưới lá xuất hiện đốm vàng cam, lớp bột màu cam (bào tử nấm). Lá cháy khô và rụng hàng loạt',
        prevention: 'Trồng giống kháng bệnh, tỉa cành thông thoáng, phun thuốc gốc đồng',
        treatment: 'Phun Hexaconazole, Cyproconazole. Tỉa cành thông thoáng vườn',
    },
    {
        id: '2',
        name: 'Bệnh khô cành (Thán thư)',
        crop: 'Cà phê',
        severity: 'high',
        image: null,
        symptoms: 'Quả xuất hiện đốm nâu đen lõm xuống, cành đen khô, rụng quả và chết cành từ ngọn',
        prevention: 'Bón phân cân đối, tăng cường phân hữu cơ, cắt bỏ cành bệnh',
        treatment: 'Phun thuốc chứa Azoxystrobin hoặc Pyraclostrobin',
    },
    {
        id: '3',
        name: 'Rệp sáp',
        crop: 'Cà phê',
        severity: 'medium',
        image: null,
        symptoms: 'Các mảng trắng bám vào chùm quả, kẽ lá, hút nhựa làm cây suy kiệt',
        prevention: 'Vệ sinh vườn sạch, kiểm tra thường xuyên, sử dụng thiên địch',
        treatment: 'Phun thuốc trừ rệp chuyên dụng, cắt tỉa cành bị nhiễm nặng',
    },
    {
        id: '4',
        name: 'Sâu đục thân',
        crop: 'Cà phê',
        severity: 'high',
        image: null,
        symptoms: 'Vết đục trên thân, cành héo vàng rồi khô chết, có thể gãy ngang thân',
        prevention: 'Cắt tỉa cành bị mọt tấn công kịp thời, tiêu hủy ngay',
        treatment: 'Bơm thuốc vào lỗ đục, phun thuốc phòng ngừa định kỳ',
    },
    {
        id: '5',
        name: 'Bệnh thối rễ',
        crop: 'Mắc ca',
        severity: 'high',
        image: null,
        symptoms: 'Cây vàng lá, héo rũ dù đủ nước. Rễ bị thối đen, vỏ gốc bong tróc',
        prevention: 'Thoát nước tốt, bón phân hữu cơ với Trichoderma, không làm tổn thương rễ',
        treatment: 'Đổ gốc thuốc trừ nấm Metalaxyl + Mancozeb',
    },
    {
        id: '6',
        name: 'Sâu đục quả',
        crop: 'Mắc ca',
        severity: 'medium',
        image: null,
        symptoms: 'Quả bị đục, có lỗ nhỏ trên vỏ, nhân bên trong bị hỏng',
        prevention: 'Thu gom quả rụng, vệ sinh vườn, phun thuốc khi ra hoa',
        treatment: 'Phun thuốc trừ sâu sinh học, đặt bẫy pheromone',
    },
    {
        id: '7',
        name: 'Bệnh nấm hồng',
        crop: 'Mắc ca',
        severity: 'medium',
        image: null,
        symptoms: 'Sợi nấm trắng chuyển hồng ở chạc cành, cành phía trên khô chết',
        prevention: 'Tỉa cành thông thoáng, phát hiện sớm và cắt bỏ',
        treatment: 'Cắt bỏ cành bệnh, phun thuốc gốc đồng hoặc Validamycin',
    },
    {
        id: '8',
        name: 'Tuyến trùng rễ',
        crop: 'Cà phê',
        severity: 'medium',
        image: null,
        symptoms: 'Cây sinh trưởng kém, lá vàng héo. Rễ tơ sưng tấy (nốt sần) hoặc thối đen',
        prevention: 'Bón phân chuồng ủ hoai với Trichoderma, không trồng lại đất cũ',
        treatment: 'Sử dụng Ethoprophos hoặc chế phẩm sinh học Paecilomyces',
    },
];

// Market prices - Điện Biên focus
export const marketPrices = [
    { id: '1', name: 'Cà phê Arabica nhân', price: 120000, unit: 'kg', change: 3.5, region: 'Điện Biên' },
    { id: '2', name: 'Cà phê Arabica quả tươi', price: 18000, unit: 'kg', change: 2.8, region: 'Mường Ảng' },
    { id: '3', name: 'Cà phê Robusta nhân', price: 95000, unit: 'kg', change: 4.2, region: 'Tuần Giáo' },
    { id: '4', name: 'Mắc ca tươi (vỏ xanh)', price: 80000, unit: 'kg', change: 5.0, region: 'Điện Biên' },
    { id: '5', name: 'Mắc ca khô (vỏ nâu)', price: 180000, unit: 'kg', change: 3.2, region: 'Tủa Chùa' },
    { id: '6', name: 'Mắc ca nhân', price: 450000, unit: 'kg', change: 2.5, region: 'Điện Biên' },
    { id: '7', name: 'Chè Shan Tuyết', price: 250000, unit: 'kg', change: 1.8, region: 'Tủa Chùa' },
    { id: '8', name: 'Gạo nương Điện Biên', price: 35000, unit: 'kg', change: 1.2, region: 'Điện Biên' },
];

// Buy listings
export const buyListings = [
    {
        id: '1',
        buyer: 'Công ty CP Cà phê Điện Biên',
        product: 'Cà phê Arabica nhân',
        quantity: '50 tấn',
        price: '125,000 đ/kg',
        location: 'TP. Điện Biên Phủ',
        phone: '0215123456',
        deadline: '15/01/2025',
    },
    {
        id: '2',
        buyer: 'HTX Mắc ca Tây Bắc',
        product: 'Mắc ca tươi (vỏ xanh)',
        quantity: '20 tấn',
        price: '85,000 đ/kg',
        location: 'Tuần Giáo',
        phone: '0215234567',
        deadline: '20/01/2025',
    },
    {
        id: '3',
        buyer: 'Thương lái Nguyễn Văn Hùng',
        product: 'Cà phê Arabica quả tươi',
        quantity: '30 tấn',
        price: '19,000 đ/kg',
        location: 'Mường Ảng',
        phone: '0912345678',
        deadline: '10/01/2025',
    },
];

// GAP Articles - Coffee & Macadamia focused
export const gapArticles = [
    {
        id: '1',
        title: 'Kỹ thuật trồng cà phê Arabica vùng Tây Bắc',
        category: 'Kỹ thuật trồng',
        crop: 'Cà phê',
        thumbnail: null,
        excerpt: 'Hướng dẫn chi tiết kỹ thuật trồng cà phê Arabica phù hợp với điều kiện khí hậu Điện Biên, từ chọn giống đến chăm sóc...',
        readTime: '12 phút',
        date: '25/12/2024',
    },
    {
        id: '2',
        title: 'Phòng trừ bệnh gỉ sắt trên cà phê hiệu quả',
        category: 'Sâu bệnh',
        crop: 'Cà phê',
        thumbnail: null,
        excerpt: 'Bệnh gỉ sắt là kẻ thù số 1 của cà phê Arabica. Nhận biết sớm và áp dụng biện pháp phòng trừ tổng hợp...',
        readTime: '10 phút',
        date: '23/12/2024',
    },
    {
        id: '3',
        title: 'Kỹ thuật bón phân cho mắc ca theo mùa',
        category: 'Phân bón',
        crop: 'Mắc ca',
        thumbnail: null,
        excerpt: 'Mắc ca cần chế độ bón phân khác nhau theo từng giai đoạn sinh trưởng. Hướng dẫn bón phân đạt năng suất cao...',
        readTime: '8 phút',
        date: '20/12/2024',
    },
    {
        id: '4',
        title: 'Thu hoạch và chế biến cà phê Arabica chất lượng cao',
        category: 'Sau thu hoạch',
        crop: 'Cà phê',
        thumbnail: null,
        excerpt: 'Thời điểm thu hoạch và phương pháp chế biến ảnh hưởng lớn đến chất lượng cà phê. Quy trình chế biến ướt và khô...',
        readTime: '15 phút',
        date: '18/12/2024',
    },
    {
        id: '5',
        title: 'Phòng trị bệnh thối rễ mắc ca',
        category: 'Sâu bệnh',
        crop: 'Mắc ca',
        thumbnail: null,
        excerpt: 'Bệnh thối rễ là nguyên nhân chính gây chết cây mắc ca. Biện pháp phòng ngừa và xử lý kịp thời...',
        readTime: '9 phút',
        date: '15/12/2024',
    },
];

// Q&A - Điện Biên farmers
export const questions = [
    {
        id: '1',
        user: 'Anh Tùng - Mường Ảng',
        question: 'Cà phê Arabica của tôi bị vàng lá mặc dù đã bón phân, là bị bệnh gì?',
        image: null,
        date: '27/12/2024',
        answers: 3,
        tags: ['Cà phê', 'Bệnh'],
    },
    {
        id: '2',
        user: 'Chị Lan - Tuần Giáo',
        question: 'Mắc ca 3 năm tuổi chưa ra hoa, có cách nào kích thích ra hoa không?',
        image: null,
        date: '26/12/2024',
        answers: 5,
        tags: ['Mắc ca', 'Kỹ thuật'],
    },
    {
        id: '3',
        user: 'Bác Minh - Điện Biên Đông',
        question: 'Thời điểm nào phun thuốc phòng bệnh gỉ sắt cho cà phê hiệu quả nhất?',
        image: null,
        date: '25/12/2024',
        answers: 4,
        tags: ['Cà phê', 'Phòng bệnh'],
    },
    {
        id: '4',
        user: 'Anh Hải - Tủa Chùa',
        question: 'Cách phân biệt mắc ca chín và chưa chín để thu hoạch đúng thời điểm?',
        image: null,
        date: '24/12/2024',
        answers: 2,
        tags: ['Mắc ca', 'Thu hoạch'],
    },
];

// AI Recommendations - Điện Biên context
export const aiRecommendations = [
    {
        id: '1',
        type: 'watering',
        title: 'Tưới nước',
        content: 'Thời tiết se lạnh, giảm lượng tưới 20%. Tưới vào buổi sáng (8-10h) khi nắng nhẹ để tránh sốc nhiệt.',
        priority: 'medium',
        icon: 'water',
    },
    {
        id: '2',
        type: 'fertilizer',
        title: 'Bón phân',
        content: 'Đầu mùa khô, bón phân Kali cho cà phê để tăng khả năng chống hạn. Kết hợp phân hữu cơ.',
        priority: 'high',
        icon: 'leaf',
    },
    {
        id: '3',
        type: 'pest',
        title: 'Phòng bệnh gỉ sắt',
        content: 'Độ ẩm cao sau sương mù sáng, nguy cơ bùng phát gỉ sắt. Kiểm tra vườn và phun phòng nếu cần.',
        priority: 'high',
        icon: 'bug',
    },
    {
        id: '4',
        type: 'market',
        title: 'Thị trường',
        content: 'Giá cà phê Arabica đang tăng 3.5%. Chuẩn bị thu hoạch đợt đầu vào tháng 1-2.',
        priority: 'medium',
        icon: 'trending-up',
    },
    {
        id: '5',
        type: 'harvest',
        title: 'Thu hoạch mắc ca',
        content: 'Mắc ca vụ muộn đang chín. Thu hoạch quả nứt vỏ tự nhiên để đảm bảo chất lượng nhân.',
        priority: 'high',
        icon: 'basket',
    },
];
