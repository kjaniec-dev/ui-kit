import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageGallery, type GalleryImage } from "./image-gallery";

const sampleImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
    alt: "Yosemite National Park Valley",
    title: "Yosemite Valley",
    caption: "Beautiful view of El Capitan and Half Dome at sunset",
  },
  {
    src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=400&auto=format&fit=crop&q=80",
    alt: "Pine tree forest during daytime",
    title: "Misty Forest",
    caption: "Morning fog drifting through a dense pine forest",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80",
    alt: "Foggy mountain peak",
    title: "Mountain Heights",
    caption: "Dramatic cloud layers covering distant alpine peaks",
  },
  {
    src: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&auto=format&fit=crop&q=80",
    alt: "Mountain landscape with lake",
    title: "Emerald Lake",
    caption: "Crystal clear water reflecting mountain shadows",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&auto=format&fit=crop&q=80",
    alt: "Green grass field under blue sky",
    title: "Rolling Hills",
    caption: "Vast green meadow extending towards the horizon",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=80",
    alt: "Sunlight filtering through trees",
    title: "Golden Hour Forest",
    caption: "Warm sunbeams illuminating woodland pathway",
  },
];

const meta = {
  title: "Components/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: "select",
      options: [2, 3, 4, 5],
    },
    aspectRatio: {
      control: "select",
      options: ["square", "video", "4/3", "auto"],
    },
    maxVisible: {
      control: "number",
    },
  },
  args: {
    images: sampleImages,
    columns: 3,
    aspectRatio: "square",
  },
} satisfies Meta<typeof ImageGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: sampleImages,
    columns: 3,
    aspectRatio: "square",
  },
};

export const MaxVisible: Story = {
  args: {
    images: sampleImages,
    columns: 3,
    maxVisible: 4,
    aspectRatio: "square",
  },
};

export const ColumnVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">2 Columns</h3>
        <ImageGallery images={sampleImages.slice(0, 4)} columns={2} />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">3 Columns</h3>
        <ImageGallery images={sampleImages} columns={3} />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">4 Columns</h3>
        <ImageGallery images={sampleImages} columns={4} />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">5 Columns</h3>
        <ImageGallery images={sampleImages} columns={5} />
      </div>
    </div>
  ),
};

export const AspectRatioOptions: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">Square (1:1)</h3>
        <ImageGallery images={sampleImages.slice(0, 3)} columns={3} aspectRatio="square" />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">Video (16:9)</h3>
        <ImageGallery images={sampleImages.slice(0, 3)} columns={3} aspectRatio="video" />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-foreground">4:3 Ratio</h3>
        <ImageGallery images={sampleImages.slice(0, 3)} columns={3} aspectRatio="4/3" />
      </div>
    </div>
  ),
};
