/** Nhận xét minh họa (FE) — tên & nội dung tiếng Việt, bố cục giống API testimonials. */
const faces = ['/img/testimonial-1.jpg', '/img/testimonial-2.jpg', '/img/testimonial-3.jpg', '/img/testimonial-4.jpg'];

function face(i) {
  return faces[i % faces.length];
}

export const VI_STUDENT_REVIEWS = [
  {
    id: 'fe-vi-1',
    author_name: 'Nguyễn Minh Anh',
    author_title: 'Học viên lớp lập trình Web',
    content:
      'Giảng viên giải thích rõ ràng, bài tập sát thực tế. Sau 8 tuần em tự làm được landing page cho dự án cá nhân.',
    rating: 5,
    image_url: face(0),
  },
  {
    id: 'fe-vi-2',
    author_name: 'Trần Quốc Huy',
    author_title: 'Nhân viên marketing → chuyển ngành IT',
    content:
      'Lịch học linh hoạt rất hợp người đi làm. Forum hỗ trợ nhanh, không bị bỏ rơi khi gặp bug.',
    rating: 5,
    image_url: face(1),
  },
  {
    id: 'fe-vi-3',
    author_name: 'Lê Phương Thảo',
    author_title: 'Sinh viên năm 3 CNTT',
    content:
      'Khóa React giúp chị hệ thống lại kiến thức. Phần hooks và state management được minh họa dễ hiểu.',
    rating: 4,
    image_url: face(2),
  },
  {
    id: 'fe-vi-4',
    author_name: 'Phạm Đức Thịnh',
    author_title: 'Freelancer thiết kế giao diện',
    content:
      'Video chất lượng, âm thanh ổn. Mong thêm bài về tối ưu hiệu năng frontend.',
    rating: 4,
    image_url: face(3),
  },
  {
    id: 'fe-vi-5',
    author_name: 'Hoàng Thu Trang',
    author_title: 'Học viên khóa dữ liệu',
    content:
      'Phần SQL và trực quan hóa bằng biểu đồ rất hay. Chị đã ứng dụng được ngay tại công ty nhỏ.',
    rating: 5,
    image_url: face(0),
  },
  {
    id: 'fe-vi-6',
    author_name: 'Võ Gia Bảo',
    author_title: 'Học sinh lớp 12',
    content:
      'Em mới bắt đầu học Python, thấy bài giảng không bị nhàm. Các ví dụ game nhỏ rất cuốn.',
    rating: 5,
    image_url: face(1),
  },
  {
    id: 'fe-vi-7',
    author_name: 'Đặng Thị Mai',
    author_title: 'Kế toán — học Excel nâng cao',
    content:
      'Không rành công nghệ nhưng vẫn theo được. File mẫu đi kèm bài giúp luyện tập thuận tiện.',
    rating: 5,
    image_url: face(2),
  },
  {
    id: 'fe-vi-8',
    author_name: 'Bùi Văn Kiệt',
    author_title: 'Lập trình viên backend',
    content:
      'Phần API và xác thực JWT trình bày gọn. Anh recommend cho team junior trong công ty.',
    rating: 5,
    image_url: face(3),
  },
  {
    id: 'fe-vi-9',
    author_name: 'Ngô Lan Chi',
    author_title: 'Học viên UX/UI',
    content:
      'Workflow từ wireframe đến prototype rõ ràng. Chị thích phần checklist đánh giá khả năng sử dụng.',
    rating: 4,
    image_url: face(0),
  },
  {
    id: 'fe-vi-10',
    author_name: 'Đinh Hoài Nam',
    author_title: 'Startup founder',
    content:
      'Khóa kinh doanh online giúp anh chuẩn hóa kênh bán hàng. Slide và case study Việt Nam rất gần gũi.',
    rating: 5,
    image_url: face(1),
  },
  {
    id: 'fe-vi-11',
    author_name: 'Trương Bích Ngọc',
    author_title: 'Giáo viên tiểu học',
    content:
      'Em đăng ký khóa làm video bài giảng. Hướng dẫn quay dựng cơ bản đủ để tự tin đăng YouTube.',
    rating: 5,
    image_url: face(2),
  },
  {
    id: 'fe-vi-12',
    author_name: 'Lý Quang Vinh',
    author_title: 'Kỹ sư tự động hóa',
    content:
      'Module Git và CI giúp anh đồng bộ quy trình với bộ phận IT. Tài liệu tiếng Việt dễ đọc.',
    rating: 4,
    image_url: face(3),
  },
  {
    id: 'fe-vi-13',
    author_name: 'Châu Kim Oanh',
    author_title: 'Học viên tiếng Anh giao tiếp',
    content:
      'Giáo viên sửa phát âm tận tình. Bài nghe có phụ đề song ngữ, em cải thiện được phản xạ hội thoại.',
    rating: 5,
    image_url: face(0),
  },
  {
    id: 'fe-vi-14',
    author_name: 'Huỳnh Nhật Tân',
    author_title: 'Sinh viên đại học',
    content:
      'Quiz sau mỗi chương giúp nhớ bài lâu. Điểm số hiển thị ngay, biết chỗ nào cần ôn lại.',
    rating: 4,
    image_url: face(1),
  },
  {
    id: 'fe-vi-15',
    author_name: 'Phan Thế Dũng',
    author_title: 'Quản lý cửa hàng bán lẻ',
    content:
      'Khóa quản trị kho và báo cáo bán hàng thực tế. Chỉ sau một tháng chị đã gửi báo cáo đẹp hơn cho sếp.',
    rating: 5,
    image_url: face(2),
  },
  {
    id: 'fe-vi-16',
    author_name: 'Vũ Hải Yến',
    author_title: 'Content creator',
    content:
      'Phần viết kịch bản và SEO rất chi tiết. Mình áp dụng được vào kênh TikTok shop của team.',
    rating: 5,
    image_url: face(3),
  },
  {
    id: 'fe-vi-17',
    author_name: 'Tôn Minh Khang',
    author_title: 'Học viên an ninh mạng cơ bản',
    content:
      'Demo tấn công trong môi trường lab an toàn, không lan man. Hiểu thêm về mật khẩu và phishing.',
    rating: 4,
    image_url: face(0),
  },
  {
    id: 'fe-vi-18',
    author_name: 'Cao Thị Hương Giang',
    author_title: 'Nhân sự — học Excel & Power BI',
    content:
      'Dashboard mẫu đẹp, hướng dẫn kéo thả trực quan. Phòng nhân sự dùng chung một file mẫu công ty.',
    rating: 5,
    image_url: face(1),
  },
  {
    id: 'fe-vi-19',
    author_name: 'Mai Xuân Phúc',
    author_title: 'Thực tập sinh phát triển web',
    content:
      'Anh ấn tượng phần code review mẫu trong bài. Biết cách đặt tên biến và tách component hợp lý hơn.',
    rating: 5,
    image_url: face(2),
  },
  {
    id: 'fe-vi-20',
    author_name: 'Lâm Thảo Vy',
    author_title: 'Học viên minh họa hoạ',
    content:
      'Brush và layer được giải từng bước. Chị vẽ xong bộ icon đơn giản cho app của chồng.',
    rating: 4,
    image_url: face(3),
  },
  {
    id: 'fe-vi-21',
    author_name: 'Đỗ Trọng Hiếu',
    author_title: 'Kỹ sư xây dựng — học BIM nhập môn',
    content:
      'Góc nhìn 3D và bài tập mẫu công trình nhỏ giúp anh làm quen nhanh với phần mềm.',
    rating: 5,
    image_url: face(0),
  },
  {
    id: 'fe-vi-22',
    author_name: 'Hồ Thị Kim Ngân',
    author_title: 'Mẹ bỉm sữa — học online buổi tối',
    content:
      'Học lúc 21h sau khi con ngủ vẫn ổn, không bị giới hạn số lần xem lại video. Cảm ơn đội ngũ hỗ trợ.',
    rating: 5,
    image_url: face(1),
  },
];
