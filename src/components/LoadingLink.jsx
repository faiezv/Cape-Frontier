import React from "react";
import { Link } from "react-router-dom";

import { useLoadingNavigate } from "./useLoadingNavigate";

function LoadingLink({
  to,
  onClick,
  children,
  className = "",
  ...props
}) {
  const navigate = useLoadingNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    onClick?.(e);

    navigate(to);
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

export default LoadingLink;
