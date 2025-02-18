import { useEffect, useState } from 'react';
import '../style/app.css'
function Users() {
  const [users, setUsers] = useState([]); // State để lưu danh sách người dùng
  const [loading, setLoading] = useState(true); // State để theo dõi trạng thái loading
  const [error, setError] = useState(null); // State để lưu lỗi (nếu có)
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState(""); // State lưu giá trị tìm kiế
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset trang về 1 khi tìm kiếm
};

// Lọc danh sách người dùng khi có query tìm kiếm
const filteredUsers = users.filter(
    (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchQuery.toLowerCase())
);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Thêm người dùng thành công');
        // Cập nhật lại danh sách người dùng
        setUsers(prevUsers => [...prevUsers, data.user]); // Giả sử data.user là người dùng mới vừa thêm
        toggleModal(); // Đóng modal
      } else {
        alert(`Thêm người dùng thất bại: ${data.message || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      alert('Lỗi kết nối đến server');
    }
  };






  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentUser),
      });
      if (response.ok) {
        alert('Cập nhật thông tin thành công');
        closeModal();
      } else {
        alert('Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Không tìm thấy người dùng:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Xóa người dùng thành công!');
          // Cập nhật danh sách người dùng
          setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        } else {
          const errorData = await response.json();
          alert(`Lỗi khi xóa người dùng: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API xóa người dùng:', error);
        alert('Có lỗi xảy ra khi xóa người dùng.');
      }
    }
  };



  // Hàm hiển thị modal và đổ dữ liệu người dùng
  const handleEditUser = (user) => {
    setCurrentUser(user); // Đổ dữ liệu người dùng vào state
    setEditModalOpen(true); // Hiển thị modal
  };

  // Hàm đóng modal
  const closeModal = () => {
    setEditModalOpen(false);
    setCurrentUser(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users?page=${currentPage}`); // Thêm tham số page vào URL
        const data = await response.json();
        console.log('API data:', data); // Kiểm tra dữ liệu trả về
        setUsers(data.users); // Cập nhật danh sách người dùng
        setTotalPages(data.totalPages); // Cập nhật tổng số trang
      } catch (error) {
        setError('Lỗi khi gọi API');
        console.error('Lỗi khi gọi API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]); // Mỗi khi currentPage thay đổi, sẽ gọi lại API

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (<>
    <>
      <div className='relative top-0 left-0 '>
        <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
          <div className="w-full mb-1">
            <div className="mb-4">
              <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                  <li className="inline-flex items-center">
                    <a
                      href="#"
                      className="inline-flex items-center text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                    >
                      <svg
                        className="w-5 h-5 mr-2.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Home
                    </a>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <a
                        href="#"
                        className="ml-1 text-gray-700 hover:text-primary-600 md:ml-2 dark:text-gray-300 dark:hover:text-white"
                      >
                        Users
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500"
                        aria-current="page"
                      >
                        List
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                  Tất cả người dùng
                </h1>
              </div>
              <div className='row mt-4'>
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="border border-gray-300 rounded-lg p-2 mb-4"
                />

                <button
                  type="button"
                  onClick={toggleModal}
                  className="text-white ml-4 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                >
                  
                  Thêm người dùng
                </button>

              </div>
            </div>
            <div className="sm:flex">

              <div className="flex items-center ml-auto space-x-2 sm:space-x-3">


              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-2xl">
              <div className="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700">
                <h3 className="text-xl font-semibold dark:text-white">Thêm người dùng mới</h3>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="first-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        placeholder='Nhập họ tên'
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="last-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Số điện thoại
                      </label>
                      <input
                        type="number"
                        value={phone}
                        placeholder='Nhập số điện thoại'
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-6 pb-6">
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Mật khẩu
                      </label>
                      <input
                        type="password"

                        value={password}
                        placeholder='Nhập mật khẩu'

                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t flex justify-end">
                    <button type="submit" className="px-5 py-2 text-white bg-primary-700 rounded-lg">
                      Thêm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}




        <div className={`fixed inset-0 z-50 ${isEditModalOpen ? 'flex' : 'hidden'} items-center justify-center`}>
          {/* Overlay - làm mờ nền */}
          <div className="absolute inset-0 bg-black opacity-50"></div>

          {/* Modal */}
          <div className="relative w-full max-w-2xl px-4 md:h-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700">
                <h3 className="text-xl font-semibold dark:text-white">Chỉnh sửa thông tin</h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto"
                  onClick={closeModal}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => handleUpdateUser(e)}>
                <div className="p-6 space-y-6">
                  <label className="block text-sm">
                    Họ và tên:
                    <input
                      type="text"
                      value={currentUser?.name || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  </label>
                  <label className="block text-sm">
                    Số điện thoại:
                    <input
                      type="number"
                      value={currentUser?.phone || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  </label>
                  <label className="block text-sm">
                    Mật khẩu:
                    <input
                      type="password"
                      value={currentUser?.password || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  </label>
                </div>
                <div className="p-6 border-t flex justify-end">
                  <button type="submit" className="px-5 py-2 text-white bg-primary-700 rounded-lg">
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>



        <div className="flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow">
                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="p-4 w-1/6 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">ID</th>
                      <th scope="col" className="p-4 w-1/4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Tên</th>
                      <th scope="col" className="p-4 w-1/4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Số điện thoại</th>
                      <th scope="col" className="p-4 w-1/4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Mật khẩu</th>
                      <th scope="col" className="p-4 w-1/6 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                          <td className="p-4 w-1/6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {user._id}
                          </td>
                          <td className="p-4 w-1/4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {user.name}
                          </td>
                          <td className="p-4 w-1/4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {user.phone}
                          </td>
                          <td className="p-4 w-1/4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {user.password.length > 2 ? `${user.password.slice(0, 2)}.........` : user.password}
                          </td>
                          <td className="p-4 w-1/6 space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800"
                              onClick={() => handleEditUser(user)}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path
                                  fillRule="evenodd"
                                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Chỉnh sửa
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-500">Không có kết quả tìm kiếm nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>


              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <a
              href="#"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'cursor-not-allowed text-gray-300' : ''}`}
            >
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`inline-flex justify-center p-1 mr-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages ? 'cursor-not-allowed text-gray-300' : ''}`}
            >
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, users.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {users.length}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="#"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Previous
            </a>
            <a
              href="#"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Next
              <svg
                className="w-5 h-5 ml-1 -mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>


      </div>

    </>
  </>);
}

export default Users;