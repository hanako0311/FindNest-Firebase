import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/ContactUs";
import Header from "./components/Header";
import Features from "./pages/Features";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import ReportForm from "./pages/ReportForm";
import ItemDetails from "./pages/ItemDetailsPage";
import ClaimForm from "./pages/ClaimForm";
import OnlyAdminPrivateRoute from "./components/OnlyAdminPrivateRoute";
import OnlySuperAdminPrivateRoute from "./components/OnlySuperAdminPrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report-form" element={<ReportForm />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/claim-form/:itemId" element={<ClaimForm />} />
        </Route>
        <Route element={<OnlyAdminPrivateRoute />}></Route>
        <Route element={<OnlySuperAdminPrivateRoute />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
