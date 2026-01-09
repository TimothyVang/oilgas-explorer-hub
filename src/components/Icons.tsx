import { cn } from "@/lib/utils";

interface IconProps {
    className?: string;
}

const GradientDefs = () => (
    <defs>
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
    </defs>
);

export const DrillIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path
            d="M12 2L14.5 9H9.5L12 2Z"
            fill="url(#primaryGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 9L8 16H16L14 9"
            fill="url(#depthGradient)"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 16V22M9 22H15"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="12" cy="18" r="1" fill="hsl(var(--accent))" />
    </svg>
);

export const FlameIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path
            d="M12 2C12 2 16 7 16 11C16 14 14.5 16 12 16C9.5 16 8 14 8 11C8 7 12 2 12 2Z"
            fill="url(#depthGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <path
            d="M12 22C16.4183 22 20 18.4183 20 14C20 10.5 18 8 16 6.5C16.5 8 16.5 9 16.5 9C19 12 19 15 17 17C16.5 17.5 15 18 12 18C9 18 7.5 17.5 7 17C5 15 5 12 7.5 9C7.5 9 7.5 8 8 6.5C6 8 4 10.5 4 14C4 18.4183 7.58172 22 12 22Z"
            fill="url(#primaryGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const FactoryIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path
            d="M2 22H22M4 22V10L8 8V12L12 10V14L16 12V22"
            fill="url(#depthGradient)"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <rect x="16" y="4" width="4" height="18" rx="1" fill="url(#primaryGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M18 4V2" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 4V2" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M19 4V2" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
);

export const ScaleIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M12 3V21" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 3H18" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" />
        <path
            d="M6 3L3 11C3 11 3 13 6 13C9 13 9 11 9 11L6 3Z"
            fill="url(#primaryGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <path
            d="M18 3L15 11C15 11 15 13 18 13C21 13 21 11 21 11L18 3Z"
            fill="url(#depthGradient)"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
);

export const LeafIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path
            d="M12 21C12 21 17 18 17 11C17 6 13 2 13 2C13 2 9 6 9 11C9 18 14 21 14 21"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M11 21C11 21 5 18 5 12C5 8 9 5 9 5"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13 2C13 2 20 5 21 11C22 17 13 21 13 21"
            fill="url(#primaryGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const HomeIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" fill="url(#depthGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const DocsIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="url(#depthGradient)" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2V8H20" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H8" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ActivityIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 21L9 3" stroke="url(#primaryGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const MoneyIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 6H23V12" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="13.5" cy="15.5" r="2" fill="url(#primaryGradient)" />
    </svg>
);

export const SettingsIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <circle cx="12" cy="12" r="3" fill="url(#depthGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M19.4 15C19.6053 14.5376 19.8974 14.12 20.26 13.76L21.6 13.76C21.7313 13.76 21.8596 13.7196 21.967 13.6447C22.0744 13.5699 22.1555 13.4643 22.1993 13.3424C22.2431 13.2205 22.2475 13.0883 22.2118 12.9638C22.1762 12.8393 22.1023 12.7286 22 12.647L20.66 11.307C20.5784 11.2047 20.4677 11.1308 20.3432 11.0952C20.2187 11.0595 20.0865 11.0639 19.9646 11.1077C19.8427 11.1515 19.7371 11.2326 19.6623 11.34C19.5874 11.4474 19.547 11.5757 19.547 11.707V12.293C19.547 12.4243 19.5874 12.5526 19.6623 12.66C19.7371 12.7674 19.8427 12.8485 19.9646 12.8923C20.0865 12.9361 20.2187 12.9405 20.3432 12.9048C20.4677 12.8692 20.5784 12.7953 20.66 12.693L22 11.353C22.1023 11.2714 22.1762 11.1607 22.2118 11.0362C22.2475 10.9117 22.2431 10.7795 22.1993 10.6576C22.1555 10.5357 22.0744 10.4301 21.967 10.3553C21.8596 10.2804 21.7313 10.24 21.6 10.24H20.26C19.8222 9.87979 19.2974 9.63756 18.74 9.54L18.74 8.2C18.74 8.0687 18.6996 7.94038 18.6247 7.83298C18.5499 7.72559 18.4443 7.64446 18.3224 7.60067C18.2005 7.55688 18.0683 7.55245 17.9438 7.58809C17.8193 7.62373 17.7086 7.69766 17.627 7.8L16.287 9.14C16.2054 9.24234 16.0947 9.31627 15.9702 9.35191C15.8457 9.38755 15.7135 9.38312 15.5916 9.33933C15.4697 9.29554 15.3641 9.21441 15.2893 9.10702C15.2144 8.99962 15.174 8.8713 15.174 8.74V7.4C15.174 7.2687 15.2144 7.14038 15.2893 7.03298C15.3641 6.92559 15.4697 6.84446 15.5916 6.80067C15.7135 6.75688 15.8457 6.75245 15.9702 6.78809C16.0947 6.82373 16.2054 6.89766 16.287 7L17.627 8.34C17.7086 8.44234 17.8193 8.51627 17.9438 8.55191C18.0683 8.58755 18.2005 8.58312 18.3224 8.53933C18.4443 8.49554 18.5499 8.41441 18.6247 8.30702C18.6996 8.19962 18.74 8.0713 18.74 7.94V6.6C18.74 6.04257 18.4978 5.51782 18.06 5.08L17.2 4.22C17.0687 4.14511 16.9404 4.10472 16.833 4.10029C16.7256 4.09586 16.62 4.12753 16.531 4.19067C16.442 4.25381 16.374 4.34522 16.336 4.45209C16.298 4.55896 16.2918 4.67615 16.318 4.787L16.66 6.127C16.6956 6.2515 16.6912 6.38374 16.6474 6.50563C16.6036 6.62752 16.5225 6.73308 16.4477 6.8079C16.3729 6.88272 16.2673 6.92311 16.1454 6.92311C16.0235 6.92311 15.9016 6.88272 15.8268 6.8079L14.4868 5.4679C14.3845 5.38634 14.2738 5.31241 14.1493 5.27677C14.0248 5.24113 13.8926 5.24556 13.7707 5.28935C13.6488 5.33314 13.5432 5.41427 13.4684 5.52166C13.3935 5.62905 13.3531 5.75737 13.3531 5.88867V7.22867C13.3531 7.7861 13.1109 8.31085 12.6731 8.74867C12.2353 9.18648 11.7105 9.42867 11.1531 9.42867H9.81313C9.68183 9.42867 9.55351 9.38828 9.44612 9.31346C9.33873 9.23864 9.2576 9.13308 9.21381 9.01119C9.17002 8.8893 9.16559 8.75706 9.20123 8.63256C9.23687 8.50806 9.3108 8.39733 9.39313 8.31501L10.7331 6.97501C10.8355 6.87267 10.9462 6.79874 11.0707 6.7631C11.1952 6.72746 11.3274 6.73189 11.4493 6.77568C11.5712 6.81947 11.6768 6.9006 11.7516 7.00799C11.8264 7.11538 11.8668 7.2437 11.8668 7.375V8.715C11.8668 9.27243 12.109 9.79718 12.5468 10.235C12.9846 10.6728 13.5094 10.915 14.0668 10.915H15.4068C15.5381 10.915 15.6664 10.9554 15.7738 11.0302C15.8812 11.105 15.9623 11.2106 16.0061 11.3325C16.0499 11.4544 16.0543 11.5866 16.0187 11.7111C15.9831 11.8356 15.9091 11.9463 15.8268 12.0287L14.4868 13.3687L19.4 15Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const VisionIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="url(#primaryGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9" stroke="url(#depthGradient)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const MissionIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="12" cy="12" r="6" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill="url(#primaryGradient)" />
        <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const ValuesIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09" fill="url(#depthGradient)" opacity="0.5" />
        <path d="M16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35" fill="url(#primaryGradient)" fillOpacity="0.2" />
        <path d="M16.5 6.5C17.5 6.5 18.5 7.5 18.5 8.5" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const TrendUpIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 6H23V12" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 6L13.5 15.5" stroke="url(#primaryGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChartIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)}>
        <GradientDefs />
        <rect x="3" y="12" width="4" height="8" rx="1" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
        <rect x="10" y="8" width="4" height="12" rx="1" fill="url(#depthGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <rect x="17" y="4" width="4" height="16" rx="1" fill="url(#primaryGradient)" stroke="hsl(var(--accent))" strokeWidth="1.5" />
    </svg>
);
