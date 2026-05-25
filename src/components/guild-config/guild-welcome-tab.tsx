'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageBuilder } from './message-builder';
import { WelcomeConfig, DiscordMessage } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import { useUpdateWelcomeConfigMutation, useWelcomeConfigQuery } from '@/lib/queries';
import { Users, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import { StickyActionBar } from './sticky-action-bar';
import {
  WELCOME_DM_TEMPLATE_VARIABLES,
  WELCOME_PUBLIC_TEMPLATE_VARIABLES,
} from './message-builder/template-variables';

interface GuildWelcomeTabProps {
  guildId: string;
}

export function GuildWelcomeTab({ guildId }: GuildWelcomeTabProps) {
  const { guildData } = useGuild();
  const welcomeQuery = useWelcomeConfigQuery(guildId);
  const updateWelcome = useUpdateWelcomeConfigMutation(guildId);
  const [draftConfig, setDraftConfig] = useState<WelcomeConfig | null>(null);
  const config = draftConfig ?? welcomeQuery.data ?? null;

  const handleSave = async () => {
    if (!config) return;

    try {
      const updatedConfig = await updateWelcome.mutateAsync(config);
      setDraftConfig(updatedConfig);
      toast.success('Welcome settings saved successfully!');
    } catch {
      toast.error('Failed to save welcome settings. Please try again.');
    }
  };

  const updateConfig = (updates: Partial<WelcomeConfig>) => {
    if (!config) return;
    setDraftConfig({ ...config, ...updates });
  };

  const updateWelcomeMessage = (message: DiscordMessage) => {
    updateConfig({ welcome_message: message });
  };

  const updateGoodbyeMessage = (message: DiscordMessage) => {
    updateConfig({ goodbye_message: message });
  };

  const updateDmMessage = (message: DiscordMessage) => {
    updateConfig({ dm_message: message });
  };

  if (welcomeQuery.isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading welcome settings...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load welcome settings.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Welcome System
        </h2>
        <p className="text-muted-foreground">
          Configure welcome and goodbye messages for new members
        </p>
      </div>

      <StickyActionBar className="justify-end">
        <div className="hidden text-sm text-muted-foreground sm:block">
          Changes are not applied until saved.
        </div>
        <Button
          onClick={handleSave}
          disabled={updateWelcome.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updateWelcome.isPending ? 'Saving...' : 'Save Welcome Settings'}
        </Button>
      </StickyActionBar>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Enable the welcome system and configure basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
            <Label>Enable Welcome System</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Welcome Channel</Label>
              <ChannelSelect
                channels={guildData?.channels || []}
                categories={guildData?.categories || []}
                value={config.welcome_channel_id || null}
                onValueChange={(value) => updateConfig({ welcome_channel_id: value })}
                placeholder="Select welcome channel"
              />
            </div>

            <div className="space-y-2">
              <Label>Goodbye Channel</Label>
              <ChannelSelect
                channels={guildData?.channels || []}
                categories={guildData?.categories || []}
                value={config.goodbye_channel_id || null}
                onValueChange={(value) => updateConfig({ goodbye_channel_id: value })}
                placeholder="Select goodbye channel"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.dm_new_users}
              onCheckedChange={(dm_new_users) => updateConfig({ dm_new_users })}
            />
            <Label>Send DM to new users</Label>
          </div>

          <div className="space-y-2">
            <Label>Auto Roles</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Roles automatically assigned to new members
            </p>
            <RoleMultiSelect
              roles={guildData?.roles || []}
              value={config.auto_roles || []}
              onValueChange={(value) => updateConfig({ auto_roles: value })}
              placeholder="Select roles to assign automatically"
              maxSelection={20}
            />
          </div>
        </CardContent>
      </Card>

      {/* Message Configuration */}
      <Tabs defaultValue="welcome" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="welcome">Welcome Message</TabsTrigger>
          <TabsTrigger value="goodbye">Goodbye Message</TabsTrigger>
          <TabsTrigger value="dm">DM Message</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Message</CardTitle>
              <CardDescription>
                Message sent when a new member joins the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.welcome_message || { content: '' }}
                onChange={updateWelcomeMessage}
                placeholder="Welcome {user.mention} to {server.name}! You are member {server.member_count}."
                guildId={guildId}
                templateVariables={WELCOME_PUBLIC_TEMPLATE_VARIABLES}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goodbye">
          <Card>
            <CardHeader>
              <CardTitle>Goodbye Message</CardTitle>
              <CardDescription>
                Message sent when a member leaves the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.goodbye_message || { content: '' }}
                onChange={updateGoodbyeMessage}
                placeholder="Goodbye {user.name}! Thanks for being part of {server.name}."
                guildId={guildId}
                templateVariables={WELCOME_PUBLIC_TEMPLATE_VARIABLES}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dm">
          <Card>
            <CardHeader>
              <CardTitle>DM Message</CardTitle>
              <CardDescription>
                Private message sent directly to new members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBuilder
                message={config.dm_message || { content: '' }}
                onChange={updateDmMessage}
                placeholder="Welcome to {server.name}, {user.name}!"
                guildId={guildId}
                templateVariables={WELCOME_DM_TEMPLATE_VARIABLES}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
} 
