export default function LiveLogo() {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Abstract shape - black mass with white geometric forms */}
      <path
        d="M0 8C0 3.58172 3.58172 0 8 0H25C30 0 32 2 32 7V15C32 20 30 22 25 22H20C18 22 17 21 17 19V17C17 15 18 14 20 14H22C23 14 24 13 24 12V8C24 7 23 6 22 6H8C7 6 6 7 6 8V32C6 33 7 34 8 34H12C13 34 14 33 14 32V30C14 28 15 27 17 27H19C21 27 22 28 22 30V32C22 33 21 34 20 34H8C3.58172 34 0 30.4183 0 26V8Z"
        fill="#000000"
      />
      
      {/* White geometric fragments */}
      <path
        d="M25 2L30 7L25 12L20 7L25 2Z"
        fill="#FFFFFF"
      />
      <path
        d="M28 5L32 9L28 13L24 9L28 5Z"
        fill="#FFFFFF"
      />
      <path
        d="M30 8L35 13L30 18L25 13L30 8Z"
        fill="#FFFFFF"
      />
      
      {/* Red circle */}
      <circle
        cx="35"
        cy="10"
        r="3"
        fill="#FF0000"
      />
      
      {/* Light blue accents */}
      <path
        d="M5 25L8 28L5 31L2 28L5 25Z"
        fill="#87CEEB"
        opacity="0.7"
      />
      <path
        d="M7 27L10 30L7 33L4 30L7 27Z"
        fill="#87CEEB"
        opacity="0.5"
      />
      
      {/* Red specks */}
      <circle cx="3" cy="26" r="0.5" fill="#FF0000" />
      <circle cx="9" cy="29" r="0.5" fill="#FF0000" />
      
      {/* "live" text */}
      <text
        x="45"
        y="25"
        fontSize="16"
        fontWeight="bold"
        fill="#000000"
        fontFamily="Arial, sans-serif"
      >
        live
      </text>
    </svg>
  );
}
