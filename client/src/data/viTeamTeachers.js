/** Đội ngũ minh họa (FE) — cùng schema với API /api/team (team_members). */
const photos = ['/img/instructor-1.jpg', '/img/instructor-2.jpg', '/img/team-1.png', '/img/team-2.png'];

function photo(i) {
  return photos[i % photos.length];
}

export const VI_TEAM_TEACHERS = [
  {
    id: 'fe-team-1',
    name: 'TS. Nguyễn Hoài Nam',
    role_title: 'Giảng viên Lập trình Web & React',
    image_url: photo(0),
    bio: '15 năm kinh nghiệm phát triển sản phẩm; hướng dẫn dự án thực tế cho học viên.',
    sort_order: 0,
  },
  {
    id: 'fe-team-2',
    name: 'ThS. Trần Thu Hà',
    role_title: 'Giảng viên Phân tích dữ liệu & SQL',
    image_url: photo(1),
    bio: 'Từng làm lead analytics tại doanh nghiệp FDI; yêu thích trực quan hóa số liệu.',
    sort_order: 1,
  },
  {
    id: 'fe-team-3',
    name: 'Lê Minh Tuấn',
    role_title: 'Giảng viên Python & tự động hóa',
    image_url: photo(2),
    bio: 'Kỹ sư phần mềm; chuyên môn script, API và pipeline xử lý dữ liệu nhỏ.',
    sort_order: 2,
  },
  {
    id: 'fe-team-4',
    name: 'Phạm Ngọc Lan',
    role_title: 'Giảng viên UX/UI & thiết kế sản phẩm',
    image_url: photo(3),
    bio: 'Designer với portfolio app và web; tập trung quy trình từ nghiên cứu đến handoff.',
    sort_order: 3,
  }
];
