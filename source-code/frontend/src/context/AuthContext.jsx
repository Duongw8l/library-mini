import { createContext, useContext, useEffect, useState } from 'react'; // Các hook React để tạo context và quản lý state
import { authApi } from '../api/services'; // Nhóm API xác thực (login, me...)

const AuthContext = createContext(null); // Tạo context lưu trạng thái đăng nhập (mặc định null)

export function AuthProvider({ children }) { // Provider bao bọc app, cung cấp thông tin đăng nhập
  const [user, setUser] = useState(null); // State: user hiện tại (null = chưa đăng nhập)
  const [loading, setLoading] = useState(true); // State: đang kiểm tra phiên đăng nhập hay chưa

  // Khôi phục phiên đăng nhập từ token đã lưu.
  useEffect(() => { // Chạy 1 lần khi component mount
    const token = localStorage.getItem('token'); // Lấy token đã lưu
    if (!token) { // Nếu không có token
      setLoading(false); // Kết thúc tải (coi như chưa đăng nhập)
      return; // Dừng
    } // Kết thúc nhánh không token
    authApi
      .me() // Gọi API lấy thông tin user theo token
      .then(setUser) // Thành công -> lưu user vào state
      .catch(() => { // Token sai/hết hạn
        localStorage.removeItem('token'); // Xóa token hỏng
      }) // Kết thúc catch
      .finally(() => setLoading(false)); // Dù sao cũng kết thúc trạng thái tải
  }, []); // Mảng phụ thuộc rỗng -> chỉ chạy một lần

  const login = async (email, password) => { // Hàm đăng nhập
    const { token, user } = await authApi.login({ email, password }); // Gọi API, nhận token và user
    localStorage.setItem('token', token); // Lưu token để phiên sau còn đăng nhập
    setUser(user); // Cập nhật user vào state
    return user; // Trả user cho nơi gọi (vd để điều hướng theo vai trò)
  }; // Kết thúc login

  const logout = () => { // Hàm đăng xuất
    localStorage.removeItem('token'); // Xóa token
    setUser(null); // Xóa user khỏi state
  }; // Kết thúc logout

  return ( // Cung cấp giá trị context cho cây con
    <AuthContext.Provider value={{ user, loading, login, logout }}> {/* Chia sẻ user, trạng thái và 2 hàm */}
      {children} {/* Render các component con */}
    </AuthContext.Provider> // Kết thúc Provider
  ); // Kết thúc return
} // Kết thúc AuthProvider

export const useAuth = () => useContext(AuthContext); // Hook tiện dụng để lấy context đăng nhập ở bất cứ đâu
