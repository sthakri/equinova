import React from "react";

module.exports = {
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/" }),
  useParams: () => ({}),
};
