import React from "react";
import "./AllNewsPage.css";
import NewsHero from "../components/news/NewsHero";
import NewsGrid from "../components/news/NewsGrid";

const AllNewsPage = () => {
  return (
    <div className="all-news-page">
      <NewsHero />
      <NewsGrid />
    </div>
  );
};

export default AllNewsPage;
