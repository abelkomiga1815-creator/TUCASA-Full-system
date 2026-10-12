import { useEffect, useState } from "react"
import { Users, Target, Eye, Building2, Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { leadershipApi } from "@/api/endpoints/leadership"
import { AboutUsResponse } from "@/types"
import { siteConfig } from "@/config/siteConfig"

const departments = [
  { name: "Spiritual Growth", description: "Bible studies, prayer meetings, discipleship programs", icon: Target },
  { name: "Worship & Music", description: "Choir, band, worship leading, music training", icon: Users },
  { name: "Outreach & Evangelism", description: "Campus evangelism, community outreach, missions", icon: Eye },
  { name: "Administration", description: "Leadership coordination, events planning, member care", icon: Building2 },
]

export default function About() {
  const [aboutData, setAboutData] = useState<AboutUsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    leadershipApi.getAboutUs()
      .then(setAboutData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 max-w-4xl">
      {loading ? (
        <div className="text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-4" />
        </div>
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary">{aboutData?.organizationName || siteConfig.organizationName}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {aboutData?.branchName || siteConfig.branchName} — University of Dar es Salaam
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={24} />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                {aboutData?.mission || "To reach, equip, and send out Christian students to impact the university community and beyond with the Gospel of Jesus Christ through discipleship, worship, and service."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={24} />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                {aboutData?.vision || "A transformed university community where every student encounters Christ, grows in faith, and becomes a faithful witness in their sphere of influence."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {departments.map((dept) => (
                  <div key={dept.name} className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <dept.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={24} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{aboutData?.contactInformation?.split('\n')[0] || "UDSM Mabibo Hostel, Main Campus"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{aboutData?.contactInformation?.split('\n')[1] || "+255 XXX XXXXXXX"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{aboutData?.contactInformation?.split('\n')[2] || "tucasa.mabibo@udsm.ac.tz"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Join Our Community</h3>
              <p className="text-primary-100 dark:text-primary-foreground/80 mb-6">
                Be part of a vibrant Christian community at UDSM Mabibo Hostel.
                Grow in faith, serve others, and make lasting friendships.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}