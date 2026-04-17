import classNames from "classnames/bind";
import styles from "../styles/BoardCategoryFilter.module.scss";
import { BoardCategory, BoardPostCategory, boardCategories } from "@/types/board";

const cn = classNames.bind(styles);

interface BoardCategoryFilterProps {
  selectedCategory: BoardPostCategory | null;
  onCategoryChange: (category: BoardPostCategory | null) => void;
}

export default function BoardCategoryFilter({
  selectedCategory,
  onCategoryChange,
}: BoardCategoryFilterProps) {
  const handleCategoryToggle = (category: BoardCategory) => {
    if (category === "?�체") {
      onCategoryChange(null);
      return;
    }
    const topic = category as BoardPostCategory;
    if (selectedCategory === topic) {
      onCategoryChange(null);
    } else {
      onCategoryChange(topic);
    }
  };

  return (
    <div className={cn("categoryFilter")}>
      <h3 className={cn("categoryTitle")}>카테고리</h3>
      <ul className={cn("categoryList")}>
        {boardCategories.map((category) => (
          <li key={category} className={cn("categoryItem")}>
            <label className={cn("categoryLabel")}>
              <input
                type="checkbox"
                checked={
                  category === "?�체"
                    ? selectedCategory === null
                    : selectedCategory === category
                }
                onChange={() => handleCategoryToggle(category)}
                className={cn("categoryCheckbox")}
              />
              <div
                className={cn("customCheckbox", {
                  checked:
                    category === "?�체"
                      ? selectedCategory === null
                      : selectedCategory === category,
                })}
              >
                {(category === "?�체"
                  ? selectedCategory === null
                  : selectedCategory === category) && (
                  <svg
                    className={cn("checkIcon")}
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6L5 9L10 2"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className={cn("categoryText")}>{category}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
