'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchWithSuggestions } from '@/components/support/SearchWithSuggestions';
import { ThumbsUp, ThumbsDown, ExternalLink, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  relatedArticles?: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'item-1',
    question: 'How do I connect my wallet?',
    answer: 'Navigate to the Wallets page and click "Add New Source". Choose your wallet type (blockchain, exchange, or wallet) and follow the connection prompts. You can connect via WalletConnect, API key, or CSV upload depending on the source.',
    relatedArticles: ['Supported wallets', 'WalletConnect guide', 'CSV import format'],
  },
  {
    id: 'item-2',
    question: 'What tax method should I use?',
    answer: 'FIFO (First In, First Out) is the most common method and recommended for most users. LIFO and HIFO can help minimize short-term gains or total gains respectively. Consult with a tax professional to determine the best method for your situation.',
    relatedArticles: ['Tax methods explained', 'FIFO vs LIFO', 'Optimizing tax strategy'],
  },
  {
    id: 'item-3',
    question: 'How do I categorize transactions?',
    answer: 'Go to the Transactions page. Any uncategorized transactions will be highlighted. Click on a transaction and select the appropriate category: Personal, Business Expense, Self-Transfer, or Gift. Proper categorization ensures accurate tax calculations.',
    relatedArticles: ['Transaction categories', 'Tax implications', 'Bulk categorization'],
  },
  {
    id: 'item-4',
    question: "What if my exchange isn't supported?",
    answer: 'You can manually upload transactions via CSV. Download your transaction history from your exchange and upload it using the CSV upload option. Make sure your CSV follows our template format.',
    relatedArticles: ['CSV template', 'Manual import guide', 'Exchange compatibility'],
  },
  {
    id: 'item-5',
    question: 'How accurate are the tax calculations?',
    answer: 'Our calculations follow IRS guidelines and are designed to be as accurate as possible. However, we recommend consulting with a qualified tax professional before filing. Our service provides assistance but does not constitute professional tax advice.',
    relatedArticles: ['IRS guidelines', 'Tax filing checklist', 'Professional review'],
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, 'yes' | 'no' | null>>({});
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src="/mascot/optimized/mascot-with-headphones-cigar-money-150.webp"
            alt="Support mascot"
            fill
            className="object-contain"
          />
        </div>
        <span>Support request submitted. We&apos;ll get back to you soon!</span>
      </div>
    );
  };

  const handleHelpful = (itemId: string, helpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [itemId]: helpful ? 'yes' : 'no' }));
    toast.success(helpful ? 'Thanks for your feedback!' : 'We\'ll work on improving this article');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filter FAQs or perform search
  };

  const filteredFAQs = searchQuery
    ? FAQ_ITEMS.filter((item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQ_ITEMS;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Help & Support</h2>
          <p className="text-muted-foreground">Get answers to your questions</p>
        </div>

        {/* Search Bar */}
        <SearchWithSuggestions onSearch={handleSearch} />

        {/* Empty Search State */}
        {searchQuery && filteredFAQs.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-4 h-48 w-48">
                  <Image
                    src="/mascot/mascot-standing.png"
                    alt="No results mascot"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold">No results found</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQs */}
        {filteredFAQs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={expandedItems[0]}
                onValueChange={(value) => setExpandedItems(value ? [value] : [])}
              >
                {filteredFAQs.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-b last:border-0"
                  >
                    <AccordionTrigger className="text-left transition-all duration-400 hover:no-underline data-[state=open]:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="animate-in slide-in-from-top-2 duration-400">
                      <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">{item.answer}</p>

                        {/* Related Articles */}
                        {item.relatedArticles && item.relatedArticles.length > 0 && (
                          <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Related Articles
                            </h4>
                            <div className="space-y-1">
                              {item.relatedArticles.map((article, index) => (
                                <button
                                  key={index}
                                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm text-primary transition-colors hover:bg-muted"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                  {article}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Was this helpful? */}
                        <div className="flex items-center gap-3 border-t pt-4">
                          <span className="text-sm text-muted-foreground">Was this helpful?</span>
                          <div className="flex gap-2">
                            <Button
                              variant={helpfulFeedback[item.id] === 'yes' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleHelpful(item.id, true)}
                              className={cn(
                                'transition-all duration-200',
                                helpfulFeedback[item.id] === 'yes' && 'scale-110'
                              )}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={helpfulFeedback[item.id] === 'no' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleHelpful(item.id, false)}
                              className={cn(
                                'transition-all duration-200',
                                helpfulFeedback[item.id] === 'no' && 'scale-110'
                              )}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <p className="text-sm text-muted-foreground">Still need help? Send us a message</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="https://www.irs.gov/businesses/small-businesses-self-employed/virtual-currencies" target="_blank" rel="noopener noreferrer">
                  <span>IRS Crypto Tax Guidelines</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>User Guide (PDF)</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Video Tutorials</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
