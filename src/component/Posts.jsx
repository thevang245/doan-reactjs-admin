import { useEffect, useState } from "react";

function Posts() {
    const [posts, setPosts] = useState([]); // State để lưu danh sách bài đăng
    const [newPost, setNewPost] = useState(null); // Thêm state để lưu trữ bài đăng mới
    const [loading, setLoading] = useState(true); // State để theo dõi trạng thái loading
    const [error, setError] = useState(null); // State để lưu lỗi (nếu có)
    const [currentPage, setCurrentPage] = useState(1); // State để quản lý trang hiện tại
    const [totalPages, setTotalPages] = useState(1); // State để quản lý tổng số tran
    const [isModalOpen, setIsModalOpen] = useState(false);// Trạng thái để điều khiển hiển thị modal theem bai dang
    const handleOpenModal = () => setIsModalOpen(true); // Mở modal
    const handleCloseModal = () => setIsModalOpen(false); // Đóng modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Trạng thái hiển thị modal chinh sua bai dang
    const [selectedPost, setSelectedPost] = useState(null); // Trạng thái lưu thông tin bài đăng được chọn
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State lưu giá trị tìm kiế

    const [selectedFacilities, setSelectedFacilities] = useState(selectedPost?.facilities || []); /// quan ly tien ich
    const handleFacilitiesChange = (e) => {
        const { value, checked } = e.target;
        setSelectedFacilities((prevFacilities) => {
            if (checked) {
                return [...prevFacilities, value]; // Thêm tiện ích
            } else {
                return prevFacilities.filter((facility) => facility !== value); // Loại bỏ tiện ích
            }
        });
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };
    const filteredPosts = posts.filter(
        (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mở modal chỉnh sửa
    const handleOpenEditModal = (post) => {
        setSelectedPost(post); // Gán thông tin bài đăng được chọn vào trạng thái
        setSelectedFacilities(post.facilities || []); // Đồng bộ tiện ích với bài đăng
        setIsEditModalOpen(true); // Hiển thị modal
    };

    // Đóng modal chỉnh sửa
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedPost(null); // Reset thông tin bài đăng sau khi đóng modal
    };

    // HÀM XÁC NHẬN VÀ GỬI LÊN SERVER SAU KHI CHỈNH SỬA
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        const requiredFields = [
            { field: "title", name: "Tiêu đề" },
            { field: "price", name: "Giá phòng" },
            { field: "roomnull", name: "Số phòng trống" },
            { field: "description", name: "Mô tả" },
            { field: "roomarea", name: "Diện tích" },
            { field: "userId", name: "Chủ phòng" },
            { field: "city", name: "Thành phố" },
            { field: "district", name: "Quận/Huyện" },
            { field: "ward", name: "Phường/Xã" },
            { field: "street", name: "Đường" },
        ];
        // Kiểm tra xem có ít nhất một tiện ích được chọn không
        if (selectedFacilities.length === 0) {
            alert("Vui lòng chọn ít nhất một tiện ích.");
            return; // Dừng lại nếu không có tiện ích nào được chọn
        }

        // Kiểm tra các trường bắt buộc như tiêu đề, giá phòng, mô tả, v.v.
        for (const { field, name } of requiredFields) {
            let value = field === "city" || field === "district" || field === "ward" || field === "street"
                ? selectedPost.address?.[field]
                : selectedPost[field];

            if (!value || (typeof value === "string" && value.trim() === "")) {
                alert(`${name} là bắt buộc.`);
                return;
            }
        }


        // Lấy danh sách file từ input
        const imageInput = document.getElementById("images");
        const imageFiles = imageInput?.files;
        let imageUrls = selectedPost.images || [];

        if (imageFiles && imageFiles.length > 0) {
            // Upload hình ảnh lên Cloudinary
            imageUrls = await uploadImagesToCloudinary(imageFiles);
        }

        // Tạo đối tượng bài đăng với URL hình ảnh mới
        const updatedPost = {
            ...selectedPost,
            utilities: selectedFacilities,  // Đồng bộ tiện ích
            category: selectedPost.roomType, // Đồng bộ roomType
            images: imageUrls, // Gắn URL hình ảnh mới
        };


        console.log("Dữ liệu gửi lên server:", updatedPost);

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${selectedPost._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedPost),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Cập nhật thành công:", data);
                alert("Cập nhật thành công!");
                // Cập nhật lại danh sách bài đăng trong state (nếu cần thiết)
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === updatedPost._id ? updatedPost : post
                    )
                );

                // Đóng modal chỉnh sửa (nếu sử dụng modal)
                handleCloseEditModal();
            } else {
                console.error("Cập nhật thất bại");
                alert("Cập nhật thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
    };




    // Xử lý thay đổi dữ liệu trong form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedPost((prevPost) => ({
            ...prevPost,
            [name]: value, // Cập nhật giá trị theo trường tương ứng
        }));
    };



    //// HÀM XÓA BÀI ĐĂNG 
    const handleDelete = async (postId) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Xóa bài đăng thành công!");
                // Cập nhật lại danh sách bài đăng sau khi xóa
                setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
            } else {
                console.error("Lỗi khi xóa bài đăng:", response);
                alert("Không thể xóa bài đăng. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Đã xảy ra lỗi khi xóa bài đăng.");
        }
    };


    /// LẤY LIST USERS HIỆN RA TRONG FORM
    useEffect(() => {
        fetch("http://localhost:5000/api/users")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.users)) {
                    setUsers(data.users); // Truy cập vào trường `users` chứa mảng người dùng
                } else {
                    console.error("Dữ liệu không phải là mảng:", data);
                }
            })
            .catch((err) => console.error("Error fetching users:", err));
    }, []);


    //// HÀM XÁC NHẬN THÊM BÀI ĐĂNG 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const address = {
            city: formData.get("city"),
            district: formData.get("district"),
            ward: formData.get("ward"),
            street: formData.get("street"),
        };

        const userId = formData.get("userId");
        const selectedUser = users.find(user => user._id === userId);
        const contactName = selectedUser?.name || "";
        const contactPhone = selectedUser?.phone || "";

        const data = {
            title: formData.get("title"),
            price: formData.get("price"),
            roomnull: formData.get("availableRooms"),
            utilities: formData.getAll("facilities"),
            roomarea: formData.get("area"),
            contactName: contactName,
            contactPhone: contactPhone,
            address: address,
            userId: formData.get("userId"),
            description: formData.get("description"),
            category: formData.get("category"),  // Lấy giá trị từ radio button
        };

        const imageFiles = formData.getAll("images"); // Lấy tất cả file ảnh
        const imageUrls = await uploadImagesToCloudinary(imageFiles);
        data.images = imageUrls; // Gán URLs ảnh vào dữ liệu

        // Gửi dữ liệu lên server
        await postRoomDataToServer(data);
    };


    /// HÀM ÚP ẢNH LÊN CLOUDINARY VÀ TRẢ VỀ URL
    const uploadImagesToCloudinary = async (imageFiles) => {
        const imageUrls = [];
        for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "imagetimtro");  // Đảm bảo thay thế bằng preset của bạn

            try {
                const response = await fetch("https://api.cloudinary.com/v1_1/dzf6e19it/image/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.secure_url) {
                    imageUrls.push(data.secure_url);  // Thêm URL của ảnh vào mảng
                }
            } catch (error) {
                console.error("Error uploading image to Cloudinary:", error);
                alert("Lỗi khi upload ảnh lên Cloudinary.");
            }
        }

        return imageUrls; // Trả về danh sách các URL ảnh
    };



    //// HÀM GỬI DỮ LIỆU LÊN SERVER KHI THÊM BÀI ĐĂNGĐĂNG
    const postRoomDataToServer = async (data) => {

        try {
            const response = await fetch("http://localhost:5000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Bài đăng được thêm thành công!");
                handleCloseModal(); // Đóng modal sau khi thêm thành công

            } else {
                const errorResponse = await response.json(); // Lấy thông báo lỗi từ server
                alert(`Đã xảy ra lỗi khi thêm bài đăng: ${errorResponse.message || 'Vui lòng thử lại.'}`);
            }
        } catch (error) {
            console.error("Error posting room data:", error);
            alert("Đã xảy ra lỗi khi kết nối tới server.");
            console.log("Data:", data);
        }
    };
    // Cập nhật danh sách bài đăng sau khi có bài đăng mới
    useEffect(() => {
        if (newPost) {
            setPosts((prevPosts) => [newPost, ...prevPosts]); // Thêm bài đăng mới vào đầu danh sách
        }
    }, [newPost]);


    //// HÀM LẤY BÀI ĐĂNG TỪ API
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/posts?page=${currentPage}`); // Thêm query parameter page
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy bài đăng');
                }
                const data = await response.json(); // Lấy dữ liệu JSON từ API
                setPosts(data.posts); // Lưu dữ liệu vào state posts
                setTotalPages(data.totalPages); // Lưu tổng số trang
            } catch (error) {
                setError(error.message); // Nếu có lỗi, lưu vào state error
            } finally {
                setLoading(false); // Đặt loading thành false khi hoàn thành
            }
        };
        fetchPosts(); // Gọi hàm fetchPosts khi component mount hoặc khi currentPage thay đổi
    }, [currentPage]); // Khi currentPage thay đổi, sẽ gọi lại hàm fetchPosts
    if (loading) {
        return <div>Đang tải bài đăng...</div>;
    }
    if (error) {
        return <div>Lỗi: {error}</div>;
    }

    if (loading) {
        return <div>Đang tải bài đăng...</div>;
    }
    if (error) {
        return <div>Lỗi: {error}</div>;
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }, 100);
            setCurrentPage(currentPage + 1);  // Tăng page lên 1
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }, 100);
            setCurrentPage(currentPage - 1);  // Giảm page đi 1
        }
    };


    return (<>
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700 ">
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
                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001-1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
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
                                            E-commerce
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
                                            Products
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>

                        {/* Tiêu đề và nút thêm bài đăng */}
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                                Tất cả bài đăng
                            </h1>
                            
                        </div>
                        <div className="mt-4 row">
                            <input
                                type="text"
                                placeholder="Tìm kiếm "
                                value={searchQuery}
                                onChange={handleSearch}
                                className="border border-gray-300 rounded-lg p-2 "
                            />
                            <button
                                id="createProductButton"
                                className="text-white ml-4 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                                type="button"
                                onClick={handleOpenModal} // Khi nhấn mở modal
                            >
                                Thêm bài đăng
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* form chỉnh sửa bài đăng */}
            {isEditModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={handleCloseModal}
                ></div>
                <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full z-50 relative overflow-y-auto max-h-[80vh]">
                    <h3 className="text-xl font-semibold mb-4">Chỉnh sửa thông tin bài đăng</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="col-span-6">
                            <label htmlFor="roomType" className="block mb-2 text-sm font-medium">
                                Loại hình
                            </label>
                            <select
                                id="roomType"
                                name="roomType"
                                value={selectedPost?.roomType || ""}
                                onChange={(e) => {
                                    const newRoomType = e.target.value;
                                    setSelectedPost((prevPost) => ({
                                        ...prevPost,
                                        roomType: newRoomType,
                                    }));
                                }}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="" disabled>-- Chọn loại hình --</option>
                                <option value="Phòng trọ">Phòng trọ</option>
                                <option value="Căn hộ">Căn hộ</option>
                                <option value="Nhà nguyên căn">Nhà nguyên căn</option>
                            </select>
                        </div>



                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                                <label htmlFor="title" className="block mb-2 text-sm font-medium">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={selectedPost?.title || ""}
                                    onChange={(e) => {
                                        const newTitle = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            title: newTitle,
                                        }));
                                    }}
                                    placeholder="Nhập tiêu đề"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="price" className="block mb-2 text-sm font-medium">
                                    Giá phòng
                                </label>
                                <input
                                    type="text"
                                    id="price"
                                    name="price"
                                    onChange={(e) => {
                                        const newPrice = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            price: newPrice,
                                        }));
                                    }}
                                    value={selectedPost?.price || ""}
                                    placeholder="Nhập giá phòng"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="availableRooms" className="block mb-2 text-sm font-medium">
                                    Số phòng trống
                                </label>
                                <input
                                    type="number"
                                    id="availableRooms"
                                    name="availableRooms"
                                    value={selectedPost?.roomnull || ""}
                                    onChange={(e) => {
                                        const newRoomnull = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            roomnull: newRoomnull,
                                        }));
                                    }}
                                    placeholder="Nhập số phòng trống"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label htmlFor="description" className="block mb-2 text-sm font-medium">
                                    Mô tả
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={selectedPost?.description || ""}
                                    onChange={(e) => {
                                        const newDescription = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            description: newDescription,
                                        }));
                                    }}
                                    placeholder="Nhập mô tả về phòng trọ"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label htmlFor="facilities" className="block mb-2 text-sm font-medium">
                                    Tiện ích
                                </label>
                                <div className="flex flex-wrap gap-4 w-full">
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="wifi"
                                            name="facilities"
                                            value="wifi"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}
                                            checked={selectedFacilities.includes("wifi")}
                                        />
                                        <label htmlFor="wifi" className="text-sm">Wi-Fi</label>

                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="fridge"
                                            name="facilities"
                                            value="Tủ lạnh"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="fridge" className="text-sm">Tủ lạnh</label>

                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="ac"
                                            name="facilities"
                                            value="Điều hòa"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="ac" className="text-sm">Điều hòa</label>
                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="washingMachine"
                                            name="facilities"
                                            value="Máy giặt"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="washingMachine" className="text-sm">Máy giặt</label>
                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="wc"
                                            name="facilities"
                                            value="WC riêng"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="wc" className="text-sm">WC riêng</label>
                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="kitchen"
                                            name="facilities"
                                            value="Bếp"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="kitchen" className="text-sm">Bếp</label>
                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="freehours"
                                            name="facilities"
                                            value="Giờ giấc tự do"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="freehours" className="text-sm">Giờ giấc tự do</label>
                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="other"
                                            name="facilities"
                                            value="Khác"
                                            className="mr-2"
                                            onChange={handleFacilitiesChange}

                                        />
                                        <label htmlFor="other" className="text-sm">Khác</label>
                                    </div>

                                </div>
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="area" className="block mb-2 text-sm font-medium">
                                    Diện tích (m²)
                                </label>
                                <input
                                    type="number"
                                    id="area"
                                    name="area"
                                    value={selectedPost?.roomarea || ""}
                                    onChange={(e) => {
                                        const newRoomarea = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            roomarea: newRoomarea,
                                        }));
                                    }}
                                    placeholder="Nhập diện tích"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label
                                    htmlFor="userId"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Chủ phòng
                                </label>

                                <select
                                    id="userId"
                                    name="userId"
                                    required
                                    value={selectedPost?.userId || ""} // Gán giá trị hiện tại của userId
                                    onChange={handleInputChange} // Xử lý khi người dùng thay đổi giá trị
                                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option value="" disabled>
                                        -- Chọn chủ phòng --
                                    </option>
                                    {Array.isArray(users) && users.length > 0 ? (
                                        users.map((user) => (
                                            <option
                                                key={user._id}
                                                value={user._id}
                                                selected={selectedPost?.userId === user._id} // So sánh để đặt mặc định
                                            >
                                                {user.name} ({user._id} - {user.phone})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Không có dữ liệu</option>
                                    )}
                                </select>

                            </div>
                            <div className="col-span-6">
                                <label htmlFor="city" className="block mb-2 text-sm font-medium">
                                    Thành phố
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={selectedPost?.address.city || ""}
                                    onChange={(e) => {
                                        const newCity = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            address: {
                                                ...prevPost.address, // Giữ nguyên các thuộc tính khác của address
                                                city: newCity, // Cập nhật ward
                                            },
                                        }));
                                    }}
                                    placeholder="Nhập thành phố"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label htmlFor="district" className="block mb-2 text-sm font-medium">
                                    Quận/Huyện
                                </label>
                                <input
                                    type="text"
                                    id="district"
                                    name="district"
                                    value={selectedPost?.address.district || ""}
                                    onChange={(e) => {
                                        const newDistrict = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            address: {
                                                ...prevPost.address, // Giữ nguyên các thuộc tính khác của address
                                                district: newDistrict, // Cập nhật ward
                                            },
                                        }));
                                    }}

                                    placeholder="Nhập quận/huyện"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label htmlFor="ward" className="block mb-2 text-sm font-medium">
                                    Phường/Xã
                                </label>
                                <input
                                    type="text"
                                    id="ward"
                                    name="ward"
                                    value={selectedPost?.address.ward || ""}
                                    onChange={(e) => {
                                        const newWard = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            address: {
                                                ...prevPost.address, // Giữ nguyên các thuộc tính khác của address
                                                ward: newWard, // Cập nhật ward
                                            },
                                        }));
                                    }}

                                    placeholder="Nhập phường/xã"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label htmlFor="street" className="block mb-2 text-sm font-medium">
                                    Đường
                                </label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={selectedPost?.address.street || ""}
                                    onChange={(e) => {
                                        const newStreet = e.target.value;
                                        setSelectedPost((prevPost) => ({
                                            ...prevPost,
                                            address: {
                                                ...prevPost.address, // Giữ nguyên các thuộc tính khác của address
                                                street: newStreet, // Cập nhật ward
                                            },
                                        }));
                                    }}
                                    placeholder="Nhập đường"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="col-span-6">
                                <label htmlFor="images" className="block mb-2 text-sm font-medium">
                                    Hình ảnh
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    name="images"
                                    multiple
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-4">
                            <form onClick={handleSubmitEdit}>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-700 text-white rounded"
                                >
                                    Lưu
                                </button>
                            </form>
                            <button
                                type="button"
                                onClick={handleCloseEditModal}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>)}

            {/* Form thêm bài đăng */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={handleCloseModal}
                    ></div>

                    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full z-50 relative overflow-y-auto max-h-[80vh]">
                        <h3 className="text-xl font-semibold mb-4">Thêm bài đăng phòng trọ</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="col-span-6 mb-4">
                                <label className="block mb-2 text-sm font-medium">Loại hình</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Phòng trọ"
                                            className="mr-2"
                                            required
                                        />
                                        Phòng trọ
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Căn hộ"
                                            className="mr-2"
                                        />
                                        Căn hộ
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Nhà nguyên căn"
                                            className="mr-2"
                                        />
                                        Nhà nguyên căn
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6">
                                    <label htmlFor="title" className="block mb-2 text-sm font-medium">
                                        Tiêu đề
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        placeholder="Nhập tiêu đề"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="price" className="block mb-2 text-sm font-medium">
                                        Giá phòng
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        placeholder="Nhập giá phòng"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="availableRooms" className="block mb-2 text-sm font-medium">
                                        Số phòng trống
                                    </label>
                                    <input
                                        type="number"
                                        id="availableRooms"
                                        name="availableRooms"
                                        placeholder="Nhập số phòng trống"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="description" className="block mb-2 text-sm font-medium">
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Nhập mô tả về phòng trọ"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="facilities" className="block mb-2 text-sm font-medium">
                                        Tiện ích
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="wifi"
                                                name="facilities"
                                                value="Wi-Fi"
                                                className="mr-2"
                                            />
                                            <label htmlFor="wifi" className="text-sm">Wi-Fi</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="fridge"
                                                name="facilities"
                                                value="Tủ lạnh"
                                                className="mr-2"
                                            />
                                            <label htmlFor="fridge" className="text-sm">Tủ lạnh</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="ac"
                                                name="facilities"
                                                value="Điều hòa"
                                                className="mr-2"
                                            />
                                            <label htmlFor="ac" className="text-sm">Điều hòa</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="washingMachine"
                                                name="facilities"
                                                value="Máy giặt"
                                                className="mr-2"
                                            />
                                            <label htmlFor="washingMachine" className="text-sm">Máy giặt</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="wc"
                                                name="facilities"
                                                value="WC riêng"
                                                className="mr-2"
                                            />
                                            <label htmlFor="wc" className="text-sm">WC riêng</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="kitchen"
                                                name="facilities"
                                                value="Bếp"
                                                className="mr-2"

                                            />
                                            <label htmlFor="kitchen" className="text-sm">Bếp</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="freehours"
                                                name="facilities"
                                                value="Giờ giấc tự do"
                                                className="mr-2"

                                            />
                                            <label htmlFor="freehours" className="text-sm">Giờ giấc tự do</label>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                id="other"
                                                name="facilities"
                                                value="Khác"
                                                className="mr-2"
                                            />
                                            <label htmlFor="other" className="text-sm">Khác</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="area" className="block mb-2 text-sm font-medium">
                                        Diện tích (m²)
                                    </label>
                                    <input
                                        type="number"
                                        id="area"
                                        name="area"
                                        placeholder="Nhập diện tích"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label
                                        htmlFor="userId"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Chủ phòng
                                    </label>

                                    <select
                                        id="userId"
                                        name="userId"
                                        required
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="" disabled>
                                            -- Chọn chủ phòng --
                                        </option>
                                        {Array.isArray(users) && users.length > 0 ? (
                                            users.map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name} ({user._id} - {user.phone})
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>Không có dữ liệu</option>
                                        )}
                                    </select>
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="city" className="block mb-2 text-sm font-medium">
                                        Thành phố
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        placeholder="Nhập thành phố"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="district" className="block mb-2 text-sm font-medium">
                                        Quận/Huyện
                                    </label>
                                    <input
                                        type="text"
                                        id="district"
                                        name="district"
                                        placeholder="Nhập quận/huyện"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="ward" className="block mb-2 text-sm font-medium">
                                        Phường/Xã
                                    </label>
                                    <input
                                        type="text"
                                        id="ward"
                                        name="ward"
                                        placeholder="Nhập phường/xã"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="street" className="block mb-2 text-sm font-medium">
                                        Đường
                                    </label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="street"
                                        placeholder="Nhập đường"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="images" className="block mb-2 text-sm font-medium">
                                        Hình ảnh
                                    </label>
                                    <input
                                        type="file"
                                        id="images"
                                        name="images"
                                        multiple
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-700 text-white rounded"
                                >
                                    Thêm bài đăng
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">

                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="checkbox-all"
                                                    aria-describedby="checkbox-1"
                                                    type="checkbox"
                                                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label htmlFor="checkbox-all" className="sr-only">
                                                    checkbox
                                                </label>
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            ID Phòng
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Tiêu đề
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Hình ảnh
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Địa chỉ
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >

                                            Giá
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Phòng trống
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Tiện ích
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Diện tích
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Mô tả
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Id chủ phòng
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Tên chủ phòng
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Số điện thoại
                                        </th>
                                        <th
                                            scope="col"
                                            className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                        >
                                            Hành động
                                        </th>

                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {filteredPosts.map(post => (
                                        <tr key={post._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <td className="w-4 p-4">
                                                <div className="flex items-center">
                                                    <input
                                                        id={`checkbox-${post._id}`}
                                                        type="checkbox"
                                                        className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <label htmlFor={`checkbox-${post._id}`} className="sr-only">checkbox</label>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                <div className="text-base font-semibold text-gray-900 dark:text-white">{post._id}</div>
                                            </td>
                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                <div className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {post.title.length > 20 ? `${post.title.slice(0, 20)}...` : post.title}
                                                </div>
                                            </td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {post.images.map((image, index) => (
                                                    <div key={index}>{image.length > 20 ? `${image.slice(0, 20)}...` : image}</div>
                                                ))}
                                            </td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <div>
                                                    <p>{post.address.city}</p>
                                                    <p>{post.address.district}</p>
                                                    <p>{post.address.ward}</p>
                                                    <p>{post.address.street}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{post.price}</td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{post.roomnull}</td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{post.utilities[0]}...</td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{post.roomarea}</td>
                                            <td className="max-w-sm p-4 overflow-hidden text-base font-normal text-gray-500 truncate xl:max-w-xs dark:text-gray-400">
                                                {post.description.length > 20 ? `${post.description.slice(0, 20)}...` : post.description}
                                            </td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{post.userId}</td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{post.contactName}</td>
                                            <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {post.contactPhone.length > 7 ? `${post.contactPhone.slice(0, 7)}...` : post.contactPhone}
                                            </td>
                                            <td className="p-4 space-x-2 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                    onClick={() => handleOpenEditModal(post)}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                    </svg>
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                                    onClick={() => handleDelete(post._id)}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Xóa bài
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>


                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pagination mt-4 text-center items-center flex justify-left space-x-2 mb-20">
                {/* Nút "Trước" */}
                {currentPage !== 1 && (
                    <button
                        className="!px-4 !py-2 !bg-gray-300 !rounded-lg !text-gray-700 !font-semibold !hover:bg-gray-400 !transition duration-300"
                        onClick={handlePreviousPage}
                    >
                        « Trước
                    </button>
                )}

                {/* Các số trang */}
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${currentPage === index + 1
                            ? "!bg-blue-500 !text-white !shadow-md !hover:bg-blue-600"
                            : "!bg-gray-200 !text-gray-600 !hover:bg-gray-300"
                            }`}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}

                {/* Nút "Sau" */}
                {currentPage !== totalPages && (
                    <button
                        className="!px-4 py-2 !bg-gray-300 !rounded-lg !text-gray-700 !font-semibold !hover:bg-gray-400 transition duration-300"
                        onClick={handleNextPage}
                    >
                        Sau »
                    </button>
                )}
            </div>












        </>

    </>);
}

export default Posts;