import React from "react";
import { NavLink } from "react-router-dom";

import iconMy   from "../image/user_12888922.png";
import iconHome from "../image/home_12888754.png";
import iconPost from "../image/note_12888817.png";
import iconChat from "../image/message_15220048.png";

import "../styles/BottomNav.css";

export default function BottomNav() {
  const items = [
    { to: "/mypage", label: "마이페이지", icon: iconMy },
    { to: "/home",   label: "메인",      icon: iconHome },
    { to: "/post",   label: "상품등록",   icon: iconPost },
    { to: "/chat",   label: "1:1 채팅",   icon: iconChat },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <img className="nav-icon" src={it.icon} alt={it.label} />
          <span className="nav-label">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
