import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
	// 0 to 100: how much of the media has downloaded, drawn behind the played range.
	bufferedPercent?: number;
};

// Thin track that turns green and reveals its thumb on hover, like a media scrubber.
const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
	({ className, bufferedPercent, ...props }, ref) => (
		<SliderPrimitive.Root
			ref={ref}
			className={cn("group/slider relative flex h-4 w-full cursor-pointer touch-none select-none items-center", className)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/20">
				{bufferedPercent !== undefined && (
					<span
						className="absolute inset-y-0 left-0 rounded-full bg-white/25 transition-[width] duration-300"
						style={{ width: `${Math.min(Math.max(bufferedPercent, 0), 100)}%` }}
						aria-hidden="true"
					/>
				)}
				<SliderPrimitive.Range className="absolute h-full rounded-full bg-white group-hover/slider:bg-primary group-focus-within/slider:bg-primary" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb className="block size-3 rounded-full bg-white opacity-0 shadow-md transition-opacity focus-visible:opacity-100 focus-visible:outline-none group-hover/slider:opacity-100 disabled:pointer-events-none" />
		</SliderPrimitive.Root>
	)
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
