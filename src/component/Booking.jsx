import { useEffect, useState } from "react";

function Booking() {
    const [bookings, setBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);
    const bookingsPerPage = 10;

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(`http://localhost:5000/bookings?page=${currentPage}&limit=${bookingsPerPage}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setBookings(data.bookings);
                setTotalBookings(data.totalBookings);  // Lưu tổng số bookings
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };

        fetchBookings();
    }, [currentPage]);

    const totalPages = Math.ceil(totalBookings / bookingsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleApproveBooking = async (bookingId) => {
        try {
            const response = await fetch(`http://localhost:5000/bookings/${bookingId}/approve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Lỗi khi xác nhận đặt phòng");
            }

            const updatedBooking = await response.json();

            // Cập nhật trạng thái trên giao diện
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking._id === bookingId ? { ...booking, status: updatedBooking.status } : booking
                )
            );
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    const handleReject = async (bookingId) => {
        try {
            const response = await fetch(`http://localhost:5000/bookings/${bookingId}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Lỗi khi từ chối đặt phòng");
            }

            const updatedBooking = await response.json();

            // Cập nhật trạng thái trên giao diện
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking._id === bookingId ? { ...booking, status: updatedBooking.status } : booking
                )
            );
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };





    return (<>
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
                        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                            Tất cả các yêu cầu đặt phòng
                        </h1>
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
                                        <th scope="col" className="p-4 w-1/8 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Tên người đặt</th>
                                        <th scope="col" className="p-4 w-1/8 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">SĐT người đặt</th>
                                        <th scope="col" className="p-4 w-1/8 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Tên chủ phòng</th>
                                        <th scope="col" className="p-4 w-1/8 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">SĐT chủ phòng</th>
                                        <th scope="col" className="p-4 w-1/6 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Địa chỉ</th>
                                        <th scope="col" className="p-4 w-1/4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Thời gian xem phòng</th>
                                        <th scope="col" className="p-4 w-1/4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {bookings.map((booking) => (
                                        <tr key={booking._id}>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">{booking._id}</td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">{booking.name}</td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">{booking.phone}</td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">
                                                {booking.postId ? booking.postId.contactName || '' : ''}
                                            </td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">
                                                {booking.postId ? booking.postId.contactPhone || '' : ''}
                                            </td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">
                                                {booking.postId && booking.postId.address
                                                    ? `${booking.postId.address.street || ''}, ${booking.postId.address.ward || ''}, ${booking.postId.address.district || ''}, ${booking.postId.address.city || ''}`
                                                    : 'null'}
                                            </td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white">
                                                {`${booking.viewTime}, ${booking.viewDate}`}
                                            </td>
                                            <td className="p-4 text-sm font-normal text-gray-900 dark:text-white flex items-center">
                                                <span
                                                    className={`w-2 h-2 rounded-full mr-2 relative ${booking.status === "approved"
                                                        ? "bg-green-500"
                                                        : booking.status === "pending"
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                        } top-[1px]`}
                                                ></span>
                                                {booking.status}
                                            </td>
                                            <td className="p-4 space-x-2 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                    onClick={() => handleApproveBooking(booking._id)}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                    </svg>
                                                    Xác nhận
                                                </button>

                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                                    onClick={() => handleReject(booking._id)}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Từ chối
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
            <div>
                {/* Các booking item */}
                <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            Showing{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {(currentPage - 1) * bookingsPerPage + 1} - {Math.min(currentPage * bookingsPerPage, totalBookings)}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {totalBookings}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handlePreviousPage}
                            className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            disabled={currentPage === totalPages}
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
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

export default Booking;