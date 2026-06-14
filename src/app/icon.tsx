import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="14" fill="#2563EB" />
        <path
          d="M20 30.5L32 20l12 10.5V46a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V30.5Z"
          fill="#EFF6FF"
        />
        <path
          d="M28 46V36a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 28h16"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
    { ...size }
  );
}
