import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Award, BookOpen, Star, Globe, Heart, CheckCircle } from "lucide-react"
import Link from "next/link"
import { AlphabetsUniverseBackground } from "@/components/AlphabetsUniverseBackground"
import IndiaMap from "@/components/IndiaMap"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <AlphabetsUniverseBackground className="top-0 left-0 w-full h-full" />
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            <Heart className="w-4 h-4 mr-2" />
            Connect with Your Heritage
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Master Indian Languages with
            <span className="text-primary"> Cultural Pride</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Learn Hindi, Urdu, Bengali, Punjabi, and more through immersive lessons designed for heritage learners and
            the diaspora community. Connect with your roots while building fluency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                <Play className="w-5 h-5 mr-2" />
                Start Free Trial
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="#preview">
                <BookOpen className="w-5 h-5 mr-2" />
                Preview Lessons
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto relative z-10">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.9★</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section id="courses" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Language Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each language course is crafted with cultural context, native pronunciation, and heritage stories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Hindi", script: "हिन्दी", students: "5.2K", color: "bg-orange-100 text-orange-800" },
              { name: "Urdu", script: "اردو", students: "2.1K", color: "bg-green-100 text-green-800" },
              { name: "Bengali", script: "বাংলা", students: "1.8K", color: "bg-blue-100 text-blue-800" },
              { name: "Punjabi", script: "ਪੰਜਾਬੀ", students: "1.3K", color: "bg-purple-100 text-purple-800" },
              { name: "Tamil", script: "தமிழ்", students: "980", color: "bg-red-100 text-red-800" },
              { name: "Telugu", script: "తెలుగు", students: "750", color: "bg-indigo-100 text-indigo-800" },
              { name: "Gujarati", script: "ગુજરાતી", students: "620", color: "bg-yellow-100 text-yellow-800" },
              { name: "Marathi", script: "मराठी", students: "540", color: "bg-pink-100 text-pink-800" },
            ].map((language) => (
              <Card key={language.name} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center pb-2">
                  <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">
                    {language.script}
                  </div>
                  <CardTitle className="text-lg">{language.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className={`mb-3 ${language.color}`}>
                    <Users className="w-3 h-3 mr-1" />
                    {language.students} learners
                  </Badge>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Method */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Our Immersive Method Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Traditional language learning vs. our cultural immersion approach
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Traditional Method */}
            <Card className="p-8">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-muted-foreground">Traditional Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Memorize vocabulary lists</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Focus on grammar rules</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Limited cultural context</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Generic content</span>
                </div>
              </CardContent>
            </Card>

            {/* Our Method */}
            <Card className="p-8 border-primary/20 bg-primary/5">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-primary flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Our Cultural Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Learn through stories and traditions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Native pronunciation with cultural context</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Heritage-focused content</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Connect with your roots</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Students Say</h2>
            <p className="text-lg text-muted-foreground">Real stories from learners reconnecting with their heritage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Priya Sharma",
                location: "Toronto, Canada",
                language: "Hindi",
                quote:
                  "Finally found a way to connect with my grandmother's stories. The cultural context makes all the difference!",
                rating: 5,
              },
              {
                name: "Ahmed Khan",
                location: "London, UK",
                language: "Urdu",
                quote:
                  "The poetry lessons helped me understand my father's favorite ghazals. This is more than language learning.",
                rating: 5,
              },
              {
                name: "Ravi Patel",
                location: "San Francisco, USA",
                language: "Gujarati",
                quote: "My kids are now excited to speak with their grandparents. The family connection is priceless.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-4 italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.location} • {testimonial.language}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Indian Languages Map */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Languages Across Bharat</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover the rich linguistic diversity of India. Hover over highlighted states to explore the native languages we teach.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              {/* Map Container */}
              <div className="lg:col-span-2">
                <div className="relative bg-gradient-to-br from-primary/5 to-secondary/10 p-8 rounded-2xl">
                  <IndiaMap />
                </div>
              </div>
              
              {/* Language Stats */}
              <div className="lg:col-span-1 space-y-6">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Language Regions</h3>
                  <p className="text-muted-foreground mb-6">
                    We proudly teach the native languages from across India, connecting you with your regional heritage.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { region: 'Northern States', languages: ['Hindi', 'Punjabi', 'Urdu'], color: '#f97316' },
                    { region: 'Western States', languages: ['Gujarati', 'Marathi'], color: '#ff6b35' },
                    { region: 'Eastern States', languages: ['Bengali'], color: '#22c55e' },
                    { region: 'Southern States', languages: ['Tamil', 'Telugu'], color: '#ef4444' }
                  ].map((region, index) => (
                    <Card key={region.region} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: region.color }}
                        ></div>
                        <div>
                          <div className="font-semibold text-sm">{region.region}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.languages.join(', ')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">8+</div>
                    <div className="text-sm text-muted-foreground mb-2">Languages Taught</div>
                    <div className="text-xs text-muted-foreground">Covering 15+ states and regions</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-12">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/10">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Find Your Heritage Language
                </h3>
                <p className="text-muted-foreground mb-6">
                  Whether you're reconnecting with your roots or exploring Indian culture, start your language journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/courses">
                      <Globe className="w-5 h-5 mr-2" />
                      Explore Languages
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/signup">
                      Start Free Trial
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Connect with Your Heritage?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of learners who are rediscovering their cultural roots through language. Start your free
            trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                <Globe className="w-5 h-5 mr-2" />
                Start Free Trial
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="#courses">Browse Languages</Link>
            </Button>
          </div>
        </div>
      </section>

      
      
    </div>
  )
}
