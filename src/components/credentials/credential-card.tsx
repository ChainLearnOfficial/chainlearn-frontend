"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Award, ExternalLink, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { CredentialNFT } from "@/types/stellar";

interface CredentialCardProps {
  credential: CredentialNFT;
  className?: string;
}

export function CredentialCard({ credential, className }: CredentialCardProps) {
  return (
    <Link href={`/credentials/${credential.id}`}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
          className
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-stellar-purple to-stellar-blue">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {credential.courseTitle}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Issued {formatDate(credential.issuedAt)}</span>
              </div>
              {credential.metadata.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {credential.metadata.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
