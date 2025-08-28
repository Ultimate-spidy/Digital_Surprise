import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, Heart, Lock, WandSparkles, Upload, CloudUpload } from "lucide-react";

const createSurpriseSchema = z.object({
  message: z.string().min(1, "Message is required").min(10, "Message must be at least 10 characters"),
  password: z.string().optional(),
  hasPassword: z.boolean().default(false),
});

type CreateSurpriseForm = z.infer<typeof createSurpriseSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const form = useForm<CreateSurpriseForm>({
    resolver: zodResolver(createSurpriseSchema),
    defaultValues: {
      message: "",
      password: "",
      hasPassword: false,
    },
  });

  const createSurpriseMutation = useMutation({
    mutationFn: async (data: CreateSurpriseForm) => {
      if (!selectedFile) {
        throw new Error("Please select a file");
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('message', data.message);
      if (data.hasPassword && data.password) {
        formData.append('password', data.password);
      }

      const response = await fetch('/api/surprises', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create surprise');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Surprise Created!",
        description: "Your magical surprise is ready to share!",
      });
      // Pass data via URL parameters so success page can display it
      const params = new URLSearchParams({
        slug: data.slug,
        qrCode: data.qrCode
      });
      setLocation(`/success/${data.id}?${params.toString()}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const onSubmit = (data: CreateSurpriseForm) => {
    createSurpriseMutation.mutate(data);
  };

  return (
    <>
      <header className="relative z-20 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-center gradient-text mb-4">
            💝 Digital Surprise
          </h1>
          <p className="text-xl md:text-2xl text-center text-muted-foreground font-medium">
            Create Your Own Birthday Surprise
          </p>
        </div>
      </header>

      <main className="relative z-20">
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="celebration-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold gradient-text mb-4">Create a Surprise! 🎉</h2>
                <p className="text-lg text-muted-foreground">Upload a special moment, add your message, and share the joy!</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      <Camera className="inline w-4 h-4 mr-2 text-primary" />
                      Upload Photo or Video
                    </label>
                    <div
                      className={`drag-drop-area rounded-xl p-8 text-center cursor-pointer ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input')?.click()}
                      data-testid="file-upload-area"
                    >
                      <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        data-testid="file-input"
                      />
                      <CloudUpload className="w-16 h-16 text-primary mb-4 mx-auto" />
                      {selectedFile ? (
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">File Selected!</h3>
                          <p className="text-muted-foreground mb-4">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">Drop your files here</h3>
                          <p className="text-muted-foreground mb-4">or click to browse</p>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full mr-2">Photos</span>
                        <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full">Videos</span>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-foreground">
                          <Heart className="inline w-4 h-4 mr-2 text-secondary" />
                          Your Special Message
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Write something beautiful... ✨"
                            className="resize-none"
                            data-testid="message-input"
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground mt-2">
                          💡 Make it personal and heartfelt!
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Protection */}
                  <div>
                    <FormField
                      control={form.control}
                      name="hasPassword"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="password-toggle"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-semibold text-foreground">
                            <Lock className="inline w-4 h-4 mr-2 text-accent" />
                            Password Protection (Optional)
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch("hasPassword") && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="mt-3">
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter a secret password..."
                                className="password-input"
                                data-testid="password-input"
                              />
                            </FormControl>
                            <div className="text-sm text-muted-foreground mt-2">
                              🛡️ Keep your surprise private until the right moment!
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full animate-pulse-celebration"
                    size="lg"
                    disabled={createSurpriseMutation.isPending || !selectedFile}
                    data-testid="create-surprise-button"
                  >
                    <WandSparkles className="w-4 h-4 mr-2" />
                    {createSurpriseMutation.isPending ? "Creating..." : "Create My Surprise! 🎁"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="celebration-card rounded-xl p-6">
            <h3 className="text-lg font-bold gradient-text mb-2">Digital Surprise</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Spreading joy, one surprise at a time ✨
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
