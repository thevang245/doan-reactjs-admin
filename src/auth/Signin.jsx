import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch("http://localhost:5000/loginadmin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert("Đăng nhập thành công!");
                localStorage.setItem("adminToken", data.token);
                navigate("/"); // Chuyển hướng đến trang admin
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };
    
    return (
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-xl p-6 space-y-6 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
                {/* Logo */}
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    TimTroDB
                </h2>
    
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
                           Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            id="email"
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Nhập tên đăng nhập"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
    
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Nhập mật khẩu"
                        
                            
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
    
                    {/* Remember me & Quên mật khẩu */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                Nhớ mật khẩu
                            </label>
                        </div>
                        <a href="#" className="text-sm text-primary-700 hover:underline dark:text-primary-500">
                            Quên mật khẩu?
                        </a>
                    </div>
    
                    {/* Nút đăng nhập */}
                    <button
                        type="submit"
                        className="w-full px-5 py-3 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800"
                    >
                        Đăng nhập
                    </button>
    
                </form>
            </div>
        </div>
    );
    
}

export default Signin;
