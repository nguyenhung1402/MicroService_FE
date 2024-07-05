import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Footer, Navbar } from "./components";

import {
  About,
  AuthPage,
  Companies,
  CompanyProfile,
  FindJobs,
  JobDetail,
  UploadJob,
  UserProfile,
} from "./pages";

import { useSelector } from "react-redux";
function Layout (){
  // Kiểm tra user logging chưa, nếu chưa logging thì chuyển sang trang khác
  const { user } = useSelector((state) => state.user);
  const location = useLocation() ;

  return user ? (
    // Nếu user log in thì chuyển đến Outlet
    <Outlet/>
  ) : (
    // Nêu user chưa log in thì sẽ chuyển hướng người dùng đến Auth page
    // Dùng state với form trong đó để xác định vị trí hiện tại của user để khi user log in vào sẽ vào trang đó
    <Navigate to='user-auth' state={{from: location}} replace />
  )
}
function App() {
  const { user } = useSelector((state) => state.user);
  return (
    <main className="bg-[#f3f4f6]">
      <Navbar />
      <Routes>
        <Route element={<Layout />}>
          {/* Nếu user đã log in thì có thể vào những trang sau */}
          <Route
            path="/"
            element={<Navigate to="/find-jobs" replace={true} />}
          />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/companies" element={<Companies />} />
          <Route
            // User sẽ có accountType, nếu không phải company account thì sẽ chuyển hướng đến user profile th
            path={
              user?.accountType === "seeker"
                ? "/user-profile"
                : "/user-profile/:id"
            }
            element={<UserProfile />}
          />
          <Route path={"/company-profile"} element={<CompanyProfile />} />
          <Route path={"/company-profile/:id"} element={<CompanyProfile />} />
          <Route path={"/upload-job"} element={<UploadJob />} />
          <Route path={"/job-detail/:id"} element={<JobDetail />} />
        </Route>

        {/* Nếu user chưa auth thì sẽ được đăng nhập những page này */}
        <Route path="/about-us" element={<About />} />
        <Route path="/user-auth" element={<AuthPage />} />
      </Routes>
      {/* Nếu như user chưa log in thì sẽ k không show footer */}
      {user && <Footer />}
    </main>
  );
}

export default App;
