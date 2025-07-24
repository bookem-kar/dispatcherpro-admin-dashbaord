import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useApiCredentials } from '@/hooks/use-api-credentials';
import { AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ApiSettings() {
  const { toast } = useToast();
  const { credentials, createCredential, updateCredential, isLoading } = useApiCredentials();
  
  const [showBubbleKey, setShowBubbleKey] = useState(false);
  const [showN8nToken, setShowN8nToken] = useState(false);
  
  const [bubbleForm, setBubbleForm] = useState({
    name: 'Bubble.io Production',
    baseUrl: '',
    apiKey: ''
  });
  
  const [n8nForm, setN8nForm] = useState({
    name: 'n8n Webhook',
    webhookUrl: '',
    authToken: ''
  });

  const bubbleCredential = credentials?.find(c => c.credential_type === 'bubble_io');
  const n8nCredential = credentials?.find(c => c.credential_type === 'n8n');

  const handleSaveBubble = async () => {
    if (!bubbleForm.baseUrl || !bubbleForm.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (bubbleCredential) {
        await updateCredential.mutateAsync({
          id: bubbleCredential.id,
          credential_name: bubbleForm.name,
          base_url: bubbleForm.baseUrl,
          api_key: bubbleForm.apiKey
        });
      } else {
        await createCredential.mutateAsync({
          credential_type: 'bubble_io',
          credential_name: bubbleForm.name,
          base_url: bubbleForm.baseUrl,
          api_key: bubbleForm.apiKey
        });
      }
      
      toast({
        title: "Success",
        description: "Bubble.io credentials saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Bubble.io credentials.",
        variant: "destructive"
      });
    }
  };

  const handleSaveN8n = async () => {
    if (!n8nForm.webhookUrl || !n8nForm.authToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (n8nCredential) {
        await updateCredential.mutateAsync({
          id: n8nCredential.id,
          credential_name: n8nForm.name,
          webhook_url: n8nForm.webhookUrl,
          auth_token: n8nForm.authToken
        });
      } else {
        await createCredential.mutateAsync({
          credential_type: 'n8n',
          credential_name: n8nForm.name,
          webhook_url: n8nForm.webhookUrl,
          auth_token: n8nForm.authToken
        });
      }
      
      toast({
        title: "Success",
        description: "n8n credentials saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save n8n credentials.",
        variant: "destructive"
      });
    }
  };

  // Load existing credentials into forms
  React.useEffect(() => {
    if (bubbleCredential) {
      setBubbleForm({
        name: bubbleCredential.credential_name,
        baseUrl: bubbleCredential.base_url || '',
        apiKey: bubbleCredential.api_key
      });
    }
    if (n8nCredential) {
      setN8nForm({
        name: n8nCredential.credential_name,
        webhookUrl: n8nCredential.webhook_url || '',
        authToken: n8nCredential.auth_token || ''
      });
    }
  }, [bubbleCredential, n8nCredential]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Settings</h1>
        <p className="text-muted-foreground">Configure your external API credentials securely.</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All API credentials are encrypted and stored securely. They are only accessible by your account.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="bubble" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bubble">Bubble.io</TabsTrigger>
          <TabsTrigger value="n8n">n8n Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="bubble">
          <Card>
            <CardHeader>
              <CardTitle>Bubble.io API Configuration</CardTitle>
              <CardDescription>
                Configure your Bubble.io app credentials for company data synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bubble-name">Configuration Name</Label>
                <Input
                  id="bubble-name"
                  value={bubbleForm.name}
                  onChange={(e) => setBubbleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bubble.io Production"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bubble-url">Base URL *</Label>
                <Input
                  id="bubble-url"
                  value={bubbleForm.baseUrl}
                  onChange={(e) => setBubbleForm(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://your-app.bubbleapps.io/version-test"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bubble-key">API Key *</Label>
                <div className="relative">
                  <Input
                    id="bubble-key"
                    type={showBubbleKey ? "text" : "password"}
                    value={bubbleForm.apiKey}
                    onChange={(e) => setBubbleForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Your Bubble.io API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowBubbleKey(!showBubbleKey)}
                  >
                    {showBubbleKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveBubble} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {bubbleCredential ? 'Update' : 'Save'} Bubble.io Credentials
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="n8n">
          <Card>
            <CardHeader>
              <CardTitle>n8n Webhook Configuration</CardTitle>
              <CardDescription>
                Configure your n8n webhook endpoint for automated workflow triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="n8n-name">Configuration Name</Label>
                <Input
                  id="n8n-name"
                  value={n8nForm.name}
                  onChange={(e) => setN8nForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., n8n Webhook"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="n8n-url">Webhook URL *</Label>
                <Input
                  id="n8n-url"
                  value={n8nForm.webhookUrl}
                  onChange={(e) => setN8nForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-n8n-instance.com/webhook/company-creation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="n8n-token">Authentication Token *</Label>
                <div className="relative">
                  <Input
                    id="n8n-token"
                    type={showN8nToken ? "text" : "password"}
                    value={n8nForm.authToken}
                    onChange={(e) => setN8nForm(prev => ({ ...prev, authToken: e.target.value }))}
                    placeholder="Your n8n webhook authentication token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowN8nToken(!showN8nToken)}
                  >
                    {showN8nToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveN8n} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {n8nCredential ? 'Update' : 'Save'} n8n Credentials
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}