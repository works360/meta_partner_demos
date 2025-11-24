"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Login check
  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setIsLoggedIn(data.loggedIn);
      } catch (err) {
        console.error("Login check failed:", err);
      }
    };
    fetchLoginStatus();
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <header className={`navbar-container ${scrolled ? "scrolled" : ""}`}>
  <div className="container d-flex justify-content-between align-items-center">

          {/* Logo */}
          <Link href="/" className="navbar-logo d-flex align-items-center">
            <Image
              src="/meta-logo.png"
              alt="Partner Demos by Meta"
              width={150}
              height={33}
            />
          </Link>

          {/* Desktop Links */}
          <nav className="navbar-links d-none d-md-flex">
            <Link href="/" className="nav-item">Home</Link>
            <Link href="/how-it-works" className="nav-item">How it Works</Link>
            <Link href="/create-kit" className="nav-item">Create Demo Kit</Link>
            <Link href="/returns" className="nav-item">Returns</Link>
            <Link href="/support" className="nav-item">Support</Link>
            <Link href="/t&c" className="nav-item">T&Cs</Link>
            {/* <Link href="/dashboard" className="nav-item">360Dashboard</Link> */}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="hamburger d-md-none"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <i className="bi bi-list"></i>
          </button>

          {/* Desktop User Dropdown */}
          <div className="navbar-user d-none d-md-block">
            <button
              className="user-icon-btn">
              <i className="bi bi-person"></i>
              <i className="bi bi-caret-down-fill dropdown-arrow"></i>
            </button>

           
              <div className="user-dropdown">
                {!isLoggedIn ? (
                  <Link href="/login" className="dropdown-item">Login</Link>
                ) : (
                  <>
                    <Link href="/my-orders" className="dropdown-item">My Orders</Link>
                    <Link href="/change-password" className="dropdown-item">Change Password</Link>
                    <Link href="/logout" className="dropdown-item logout">Logout</Link>
                  </>
                )}
              </div>
            
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE MENU */}
      <div className={`mobile-menu ${mobileMenu ? "open" : ""}`}>
        <Link href="/" onClick={() => setMobileMenu(false)}>Home</Link>
        <Link href="/how-it-works" onClick={() => setMobileMenu(false)}>How it Works</Link>
        <Link href="/create-kit" onClick={() => setMobileMenu(false)}>Create Demo Kit</Link>
        <Link href="/returns" onClick={() => setMobileMenu(false)}>Returns</Link>
        <Link href="/support" onClick={() => setMobileMenu(false)}>Support</Link>
        <Link href="/t&c" onClick={() => setMobileMenu(false)}>T&C</Link>
        <Link href="/dashboard" onClick={() => setMobileMenu(false)}>360Dashboard</Link>

        {/* USER OPTIONS IN MOBILE */}
        <div className="mobile-user-section">
          {!isLoggedIn ? (
            <Link href="/login" onClick={() => setMobileMenu(false)}>Login</Link>
          ) : (
            <>
              <Link href="/my-orders" onClick={() => setMobileMenu(false)}>My Orders</Link>
              <Link href="/change-password" onClick={() => setMobileMenu(false)}>Change Password</Link>
              <Link href="/logout" onClick={() => setMobileMenu(false)} className="logout">Logout</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}