import { cn } from "@/lib/utils" // Make sure this path is correct
import { TestimonialCard, TestimonialAuthor } from "@/app/components/ui/testimonials" // Adjusted path

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  // Duplicate testimonials for a smoother marquee effect with enough items
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section id="depoimentos" className={cn( // Added id="depoimentos"
      "bg-slate-50 dark:bg-slate-800 text-foreground", // Adjusted background colors
      "py-16 md:py-24", // Adjusted padding
      className
    )}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 text-center md:gap-16"> {/* Adjusted max-width and gap */}
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 sm:gap-6"> {/* Adjusted gap */}
          <h2 className="max-w-[720px] text-balance text-3xl font-bold leading-tight text-slate-800 dark:text-slate-100 md:text-4xl"> {/* Adjusted font size/weight */}
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-slate-600 dark:text-slate-300 md:text-lg"> {/* Adjusted font size/weight */}
            {description}
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div 
            className="group flex overflow-hidden p-2 [--gap:1.5rem] [gap:var(--gap)] flex-row [--duration:60s]" // Increased gap and duration
          >
            {/* Animated Marquee Content */}
            <div className="flex flex-shrink-0 animate-marquee motion-safe:group-hover:[animation-play-state:paused] [gap:var(--gap)] flex-row">
              {/* Render duplicated testimonials */}
              {duplicatedTestimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={i} // Using index as key for duplicated items
                    {...testimonial}
                  />
              ))}
            </div>
             {/* Second set for seamless looping - necessary for visually smooth infinite scroll */}
             <div className="flex flex-shrink-0 animate-marquee motion-safe:group-hover:[animation-play-state:paused] [gap:var(--gap)] flex-row" aria-hidden="true">
               {duplicatedTestimonials.map((testimonial, i) => (
                   <TestimonialCard
                     key={`clone-${i}`} // Different key for clones
                     {...testimonial}
                   />
               ))}
             </div>
          </div>

          {/* Fade overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-slate-50 dark:from-slate-800 sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-slate-50 dark:from-slate-800 sm:block" />
        </div>
      </div>
    </section>
  )
}
