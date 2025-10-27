import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useWorkshopContext } from '@/context/WorkshopContext';
import { UsersService } from '@/client';
import { useCreateWorkshop } from '@/hooks/useWorkshopApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const UserLogin: React.FC = () => {
  const { setUser } = useUser();
  const { workshopId, setWorkshopId } = useWorkshopContext();
  const createWorkshop = useCreateWorkshop();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'participant' as 'facilitator' | 'sme' | 'participant'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newUser = await UsersService.createUserUsersUsersPost({
        ...formData,
        workshop_id: workshopId
      });

      await setUser(newUser);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.detail || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'facilitator' | 'sme' | 'participant') => {
    setIsLoading(true);
    setError(null);

    try {
      const demoEmail = `${role}@workshop.demo`;
      console.log(`🔄 Quick login as ${role} (${demoEmail}) for workshop ${workshopId}`);
      
      let currentWorkshopId = workshopId;
      
      // If no workshop exists and user is facilitator, create one
      if (!currentWorkshopId && role === 'facilitator') {
        console.log('🏗️ No workshop exists, creating new workshop for facilitator...');
        try {
          const newWorkshop = await createWorkshop.mutateAsync({
            name: `Demo Workshop - ${new Date().toLocaleDateString()}`,
            description: 'Auto-created demo workshop for facilitator login',
            facilitator_id: 'demo_facilitator'
          });
          
          console.log('✅ Created new workshop:', newWorkshop);
          currentWorkshopId = newWorkshop.id;
          setWorkshopId(currentWorkshopId);
          
          // Update URL to include workshop ID
          window.history.pushState({}, '', `?workshop=${currentWorkshopId}`);
        } catch (error) {
          console.error('❌ Failed to create workshop:', error);
          setError(`Failed to create workshop: ${error.message || 'Unknown error'}`);
          return;
        }
      }
      
      // If still no workshop and not facilitator, show error
      if (!currentWorkshopId) {
        setError(`No workshop available. Please wait for a facilitator to create one, or login as facilitator to create a new workshop.`);
        return;
      }
      
      // First, try to find existing user with this email and workshop
      const existingUsers = await UsersService.listUsersUsersUsersGet(currentWorkshopId);
      const existingUser = existingUsers.find(u => u.email === demoEmail);
      
      if (existingUser) {
        // Use existing user
        console.log('✅ Found existing user:', existingUser);
        await setUser(existingUser);
      } else {
        // Create new user if doesn't exist
        console.log('🆕 Creating new user...');
        const newUser = await UsersService.createUserUsersUsersPost({
          email: demoEmail,
          name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role,
          workshop_id: currentWorkshopId
        });

        console.log('✅ Created new user:', newUser);
        await setUser(newUser);
      }
    } catch (error: any) {
      console.error('❌ Quick login failed:', error);
      console.error('Error details:', {
        status: error.status,
        message: error.message,
        body: error.body
      });
      setError(error.response?.data?.detail || 'Failed to login as demo user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Workshop</CardTitle>
          <CardDescription>
            Enter your details to participate in the workshop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="sme">Subject Matter Expert</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Workshop'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use demo accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickLogin('facilitator')}
              disabled={isLoading}
            >
              Demo Facilitator
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickLogin('sme')}
              disabled={isLoading}
            >
              Demo SME
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickLogin('participant')}
              disabled={isLoading}
            >
              Demo Participant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};