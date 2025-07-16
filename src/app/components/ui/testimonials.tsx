import { cn } from "@/lib/utils" // Make sure this path is correct
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar" // Adjusted path

export interface TestimonialAuthor {
  name: string;
  handle: string; // We'll use the 'role' for this for now
  avatar: string; // URL for the avatar image
  avatarFallback: string; // Fallback initials
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  // Use 'a' tag if href is provided, otherwise use 'div'
  const CardComponent = href ? 'a' : 'div';
  
  return (
    <CardComponent
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})} // Add target blank for external links
      className={cn(
        "flex w-[300px] flex-col rounded-lg border border-slate-200 dark:border-slate-700", // Fixed width and standard border
        "bg-gradient-to-b from-slate-50/50 to-slate-100/10 dark:from-slate-800/50 dark:to-slate-800/10", // Background gradient
        "p-4 text-start sm:p-6", // Padding
        "hover:from-slate-100/60 hover:to-slate-200/20 dark:hover:from-slate-700/60 dark:hover:to-slate-700/20", // Hover effect
        "transition-colors duration-300", // Transition
        "flex-shrink-0", // Prevent shrinking in flex container (marquee)
        className
      )}
    >
      {/* Author section */}
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11"> {/* Slightly larger avatar */}
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-100"> {/* Adjusted text size */}
            {author.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400"> {/* Adjusted text size */}
            {author.handle} 
          </p>
        </div>
      </div>
      {/* Testimonial text */}
      <p className="sm:text-sm mt-4 text-xs text-slate-600 dark:text-slate-300 leading-normal"> {/* Adjusted text size and leading */}
        &quot;{text}&quot;
      </p>
    </CardComponent>
  )
}
