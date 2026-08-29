'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Twitter, Linkedin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { QrCode } from '@/components/credentials/qr-code';
import { cn } from '@/lib/utils/cn';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}

export function ShareButton({ 
  url, 
  title = 'Check this out!', 
  text = '',
  className,
  variant = 'outline'
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleShareClick = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing', err);
          setOpen(true);
        }
      }
    } else {
      setOpen(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || title)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Button variant={variant} size="sm" onClick={handleShareClick} className={cn("gap-2", className)}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Share this page with others or scan the QR code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="bg-white p-2 rounded-xl">
              <QrCode value={url} size={160} />
            </div>
            
            <div className="flex items-center space-x-2 w-full">
              <div className="grid flex-1 gap-2">
                <input
                  id="link"
                  defaultValue={url}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                />
              </div>
              <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                <span className="sr-only">Copy</span>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" className="w-full gap-2" onClick={shareToTwitter}>
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
              Twitter
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={shareToLinkedIn}>
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              LinkedIn
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
