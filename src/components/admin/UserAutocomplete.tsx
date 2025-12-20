import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, ChevronsUpDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'

type UserProfile = {
  id: string
  parent_name: string
  child_name?: string
  profile_image?: string
  skills?: string[]
}

interface UserAutocompleteProps {
  value?: string
  onValueChange: (userId: string, user: UserProfile | null) => void
  placeholder?: string
}

export const UserAutocomplete = ({ value, onValueChange, placeholder = 'Select user...' }: UserAutocompleteProps) => {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, parent_name, child_name, profile_image, skills')
        .order('parent_name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast.error('Failed to load users')
      logger.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find(u => u.id === value)

  const filteredUsers = users.filter(user =>
    user.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.child_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedUser.profile_image} />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span>{selectedUser.parent_name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search users..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Loading...' : 'No users found.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    onValueChange(user.id === value ? '' : user.id, user.id === value ? null : user)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === user.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={user.profile_image} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{user.parent_name}</span>
                    {user.child_name && (
                      <span className="text-xs text-muted-foreground">
                        Child: {user.child_name}
                      </span>
                    )}
                    {user.skills && user.skills.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Skills: {user.skills.join(', ')}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
