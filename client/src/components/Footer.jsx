import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} Crave the Code. All rights reserved.</p>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#about">About</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
