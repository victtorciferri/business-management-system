import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
  interval?: number
}

export function TimePicker({
  value,
  onChange,
  className,
  interval = 15
}: TimePickerProps) {
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12
        const period = hour < 12 ? 'AM' : 'PM'
        const formattedMinute = minute.toString().padStart(2, '0')
        const formattedTime = `${formattedHour}:${formattedMinute} ${period}`
        const value = `${hour.toString().padStart(2, '0')}:${formattedMinute}`
        options.push({ display: formattedTime, value })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const formatDisplayTime = (timeValue: string) => {
    if (!timeValue) return ""
    const [hours, minutes] = timeValue.split(':')
    const hour = parseInt(hours, 10)
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12
    const period = hour < 12 ? 'AM' : 'PM'
    return `${formattedHour}:${minutes} ${period}`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal", 
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatDisplayTime(value) : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <ScrollArea className="h-72">
          <div className="rounded-md border">
            {timeOptions.map((time) => (
              <div 
                key={time.value}
                onClick={() => onChange(time.value)}
                className={cn(
                  "flex items-center p-2 cursor-pointer hover:bg-muted",
                  value === time.value && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {time.display}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
