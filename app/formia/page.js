'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/formia-auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  PlusCircle, 
  Settings, 
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/formia-supabase'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDocuments: 0,
    documentsThisMonth: 0,
    documentsToday: 0,
    totalUsers: 0
  })
  const [recentDocuments, setRecentDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [profile])

  const loadDashboardData = async () => {
    if (!profile) {
      setLoading(false)
      return
    }

    try {
      // Statistiques des documents
      const { count: totalDocs, error: e1 } = await supabase
        .from('formia_documents')
        .select('*', { count: 'exact', head: true })

      if (e1) console.error('Error counting docs:', e1)

      // Nombre d'utilisateurs (seulement pour super_admin)
      let totalUsers = 0
      if (profile.role === 'super_admin') {
        const { count, error: e2 } = await supabase
          .from('formia_user_profiles')
          .select('*', { count: 'exact', head: true })
        if (e2) console.error('Error counting users:', e2)
        totalUsers = count || 0
      }

      setStats({
        totalDocuments: totalDocs || 0,
        documentsThisMonth: 0,
        documentsToday: 0,
        totalUsers
      })

      // Derniers documents (5 plus récents)
      const { data: docs, error: e3 } = await supabase
        .from('formia_documents')
        .select('id, document_number, client_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (e3) console.error('Error loading docs:', e3)

      setRecentDocuments(docs || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const displayName = profile ? `${profile.prenom} ${profile.nom}` : user?.email?.split('@')[0] || 'Utilisateur'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Premium */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                {getGreeting()}, {displayName}
              </h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium">
              {profile?.role === 'super_admin' && '💎 Administrateur'}
              {profile?.role === 'admin_agence' && '⚡ Responsable'}
              {profile?.role === 'technicien' && '🎯 Technicien'}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Actions principales */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Action principale - Nouveau rapport */}
          <Card 
            className="lg:col-span-2 cursor-pointer group hover:shadow-xl transition-all duration-300 border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative"
            onClick={() => router.push('/formia/nouveau')}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Action principale
                  </div>
                  <h3 className="text-2xl font-semibold">Créer un rapport</h3>
                  <p className="text-slate-300 text-sm max-w-md">
                    Générez un nouveau rapport de maintenance professionnel en quelques minutes
                  </p>
                  <Button 
                    className="mt-4 bg-white text-slate-900 hover:bg-slate-100 group-hover:translate-x-1 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/formia/nouveau')
                    }}
                  >
                    Nouveau rapport
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <PlusCircle className="w-16 h-16 text-white/20" />
              </div>
            </CardContent>
          </Card>

          {/* Actions secondaires */}
          <div className="space-y-4">
            {(profile?.role === 'super_admin' || profile?.role === 'admin_agence') && (
              <Card 
                className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-slate-300"
                onClick={() => router.push('/formia/admin')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                      <Settings className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Administration</h3>
                  <p className="text-sm text-slate-600">Gérer entités, agences et utilisateurs</p>
                </CardContent>
              </Card>
            )}

            {profile?.role === 'super_admin' && (
              <Card 
                className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-slate-300"
                onClick={() => router.push('/formia/settings')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                      <Settings className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Paramètres</h3>
                  <p className="text-sm text-slate-600">Configuration SMTP et licence</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Statistiques épurées */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-700" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Rapports générés</p>
              <p className="text-4xl font-semibold text-slate-900">{stats.totalDocuments}</p>
            </CardContent>
          </Card>

          {profile?.role === 'super_admin' && (
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-700" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Utilisateurs actifs</p>
                <p className="text-4xl font-semibold text-slate-900">{stats.totalUsers}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-amber-900 mb-1">Statut système</p>
              <p className="text-2xl font-semibold text-amber-900">Opérationnel</p>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">Activité récente</CardTitle>
                <CardDescription className="mt-1">Derniers rapports générés</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentDocuments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900 mb-2">Aucun rapport pour le moment</p>
                <p className="text-sm text-slate-600 mb-6">Commencez par créer votre premier rapport de maintenance</p>
                <Button 
                  onClick={() => router.push('/formia/nouveau')} 
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Créer un rapport
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDocuments.map((doc, index) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (doc.status === 'draft') {
                        // Ouvrir le brouillon pour édition
                        router.push(`/formia/nouveau?draft=${doc.id}`)
                      } else {
                        // Ouvrir le PDF du rapport terminé
                        if (doc.pdf_url) {
                          window.open(doc.pdf_url, '_blank')
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                        <FileText className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{doc.document_number}</p>
                        <p className="text-sm text-slate-600">{doc.client_name || 'Sans nom'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {doc.status === 'completed' ? '✓ Terminé' : 'Brouillon'}
                      </div>
                      <p className="text-sm text-slate-500 w-24 text-right">
                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
