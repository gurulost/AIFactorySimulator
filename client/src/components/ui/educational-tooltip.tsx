import React, { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpenIcon } from "lucide-react";

interface EducationalTooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  buttonPosition?: "right" | "inline" | "below";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  resourceColor?: string;
}

export function EducationalTooltip({
  children,
  content,
  buttonPosition = "right",
  side = "right",
  align = "center",
  resourceColor = "amber-400",
  // For backward compatibility
  icon,
}: EducationalTooltipProps & { icon?: ReactNode }) {
  // Map resourceColor to specific Tailwind classes
  const getButtonClasses = () => {
    switch(resourceColor) {
      case 'blue-400':
        return 'bg-blue-400/20 border-blue-400/40 text-blue-400 hover:bg-blue-400/30';
      case 'green-400':
        return 'bg-green-400/20 border-green-400/40 text-green-400 hover:bg-green-400/30';
      case 'purple-400':
        return 'bg-purple-400/20 border-purple-400/40 text-purple-400 hover:bg-purple-400/30';
      case 'amber-400':
      default:
        return 'bg-amber-400/20 border-amber-400/40 text-amber-400 hover:bg-amber-400/30';
    }
  };

  // Create content based on button position
  const renderTriggerContent = () => {
    if (buttonPosition === "right") {
      return (
        <div className="inline-flex items-center gap-2">
          {children}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${getButtonClasses()} 
            text-xs font-medium transition-colors cursor-pointer`}>
            <BookOpenIcon className="w-3 h-3 mr-1" />
            Learn
          </span>
        </div>
      );
    } else if (buttonPosition === "inline") {
      return (
        <span className="inline">
          {children}{" "}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${getButtonClasses()} 
            text-xs font-medium transition-colors cursor-pointer`}>
            <BookOpenIcon className="w-3 h-3 mr-1" />
            Learn
          </span>
        </span>
      );
    } else {
      return (
        <div className="flex flex-col items-start gap-1">
          {children}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${getButtonClasses()} 
            text-xs font-medium transition-colors cursor-pointer`}>
            <BookOpenIcon className="w-3 h-3 mr-1" />
            Learn
          </span>
        </div>
      );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="cursor-help">
          {renderTriggerContent()}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align} 
          className="max-w-xs p-4 text-sm bg-gray-800 border-gray-700"
        >
          <div className="text-gray-200">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ResourceTooltip({
  children,
  content,
  resourceType,
  buttonPosition,
}: Omit<EducationalTooltipProps, "resourceColor"> & { resourceType: "compute" | "data" | "algorithm" | "intelligence" }) {
  // Colored resources 
  const resourceColors = {
    compute: "blue-400",
    data: "green-400",
    algorithm: "purple-400",
    intelligence: "amber-400"
  };

  return (
    <EducationalTooltip 
      content={content}
      resourceColor={resourceColors[resourceType]}
      buttonPosition={buttonPosition}
    >
      {children}
    </EducationalTooltip>
  );
}