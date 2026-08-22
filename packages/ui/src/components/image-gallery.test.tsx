import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageGallery, type GalleryImage } from "./image-gallery";

const testImages: GalleryImage[] = [
  {
    src: "https://example.com/image1.jpg",
    alt: "First Image",
    title: "Title 1",
    caption: "Caption for first image",
  },
  {
    src: "https://example.com/image2.jpg",
    alt: "Second Image",
    title: "Title 2",
    caption: "Caption for second image",
  },
  {
    src: "https://example.com/image3.jpg",
    alt: "Third Image",
    thumbnailSrc: "https://example.com/thumb3.jpg",
  },
  {
    src: "https://example.com/image4.jpg",
    alt: "Fourth Image",
  },
  {
    src: "https://example.com/image5.jpg",
    alt: "Fifth Image",
  },
];

describe("ImageGallery", () => {
  describe("thumbnail grid rendering", () => {
    it("renders all thumbnails when no maxVisible is set", () => {
      render(<ImageGallery images={testImages} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(testImages.length);
    });

    it("uses thumbnailSrc when provided, otherwise falls back to src", () => {
      render(<ImageGallery images={testImages} />);
      const imgs = screen.getAllByRole("img");
      expect(imgs[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
      expect(imgs[2]).toHaveAttribute("src", "https://example.com/thumb3.jpg");
    });

    it("applies default 3 column grid class and custom column grid classes", () => {
      const { container, rerender } = render(<ImageGallery images={testImages} />);
      const grid = container.firstElementChild;
      expect(grid?.className).toContain("grid-cols-3");

      rerender(<ImageGallery images={testImages} columns={4} />);
      expect(container.firstElementChild?.className).toContain("grid-cols-4");

      rerender(<ImageGallery images={testImages} columns={2} />);
      expect(container.firstElementChild?.className).toContain("grid-cols-2");

      rerender(<ImageGallery images={testImages} columns={5} />);
      expect(container.firstElementChild?.className).toContain("grid-cols-5");
    });

    it("applies default square aspect ratio and custom aspect ratio classes", () => {
      const { container, rerender } = render(<ImageGallery images={testImages} />);
      const thumbnailWrapper = container.querySelector("button");
      expect(thumbnailWrapper?.className).toContain("aspect-square");

      rerender(<ImageGallery images={testImages} aspectRatio="video" />);
      const newWrapper = container.querySelector("button");
      expect(newWrapper?.className).toContain("aspect-video");
    });
  });

  describe("maxVisible overlay count", () => {
    it("renders only maxVisible thumbnails and displays overlay count on the last thumbnail", () => {
      render(<ImageGallery images={testImages} maxVisible={3} />);
      const gridButtons = screen.getAllByRole("button");
      expect(gridButtons).toHaveLength(3);

      // Remaining count: 5 total - 3 maxVisible + 1 = 3 remaining represented by overlay
      expect(screen.getByText("+3")).toBeInTheDocument();
    });

    it("does not show overlay count when images count is less than or equal to maxVisible", () => {
      render(<ImageGallery images={testImages.slice(0, 3)} maxVisible={4} />);
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });
  });

  describe("modal lightbox opening and closing", () => {
    it("is initially closed and opens when thumbnail is clicked", () => {
      render(<ImageGallery images={testImages} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      const thumbnails = screen.getAllByRole("button");
      fireEvent.click(thumbnails[1]); // Click second image

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Lightbox displays active image
      const lightboxImg = screen
        .getAllByRole("img")
        .find((img) => img.getAttribute("src") === "https://example.com/image2.jpg");
      expect(lightboxImg).toBeInTheDocument();
    });

    it("calls onImageClick callback when thumbnail is clicked", () => {
      const onImageClick = vi.fn();
      render(<ImageGallery images={testImages} onImageClick={onImageClick} />);

      const thumbnails = screen.getAllByRole("button");
      fireEvent.click(thumbnails[2]);

      expect(onImageClick).toHaveBeenCalledWith(2);
    });

    it("opens lightbox at thumbnail index when clicking overlay thumbnail", () => {
      render(<ImageGallery images={testImages} maxVisible={3} />);
      const overlayBtn = screen.getByText("+3").closest("button");
      expect(overlayBtn).toBeInTheDocument();

      fireEvent.click(overlayBtn!);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("3 of 5")).toBeInTheDocument();
    });

    it("closes lightbox when close button is clicked", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[0]);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      const closeBtn = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("image counter", () => {
    it("displays correct counter text in lightbox", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[0]);

      expect(screen.getByText("1 of 5")).toBeInTheDocument();
    });
  });

  describe("title and caption display", () => {
    it("displays title and caption when present for active image", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[0]); // First image

      expect(screen.getByText("Title 1")).toBeInTheDocument();
      expect(screen.getByText("Caption for first image")).toBeInTheDocument();
    });

    it("hides title and caption elements when omitted", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[3]); // Fourth image without title/caption

      expect(screen.queryByText("Title 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Title 4")).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("navigates with Next and Previous buttons", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[0]); // Start at index 0

      expect(screen.getByText("1 of 5")).toBeInTheDocument();

      const nextBtn = screen.getByRole("button", { name: /next/i });
      const prevBtn = screen.getByRole("button", { name: /previous/i });

      fireEvent.click(nextBtn);
      expect(screen.getByText("2 of 5")).toBeInTheDocument();
      expect(screen.getByText("Title 2")).toBeInTheDocument();

      fireEvent.click(prevBtn);
      expect(screen.getByText("1 of 5")).toBeInTheDocument();

      // Wrap around on Previous from index 0 to last index
      fireEvent.click(prevBtn);
      expect(screen.getByText("5 of 5")).toBeInTheDocument();
    });

    it("navigates with ArrowRight and ArrowLeft keyboard keys", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[0]);

      expect(screen.getByText("1 of 5")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "ArrowRight" });
      expect(screen.getByText("2 of 5")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "ArrowLeft" });
      expect(screen.getByText("1 of 5")).toBeInTheDocument();
    });

    it("closes lightbox when Escape key is pressed", () => {
      render(<ImageGallery images={testImages} />);
      fireEvent.click(screen.getAllByRole("button")[0]);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
