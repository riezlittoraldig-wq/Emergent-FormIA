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
  BarChart3, 
  Clock, 
  CheckCircle,
  Users,
  Building2,
  TrendingUp,
  Calendar
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
    if (!profile) return

    try {
      // Statistiques des documents
      const { count: totalDocs } = await supabase
        .from('formia_documents')
        .select('*', { count: 'exact', head: true })

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: docsThisMonth } = await supabase
        .from('formia_documents')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { count: docsToday } = await supabase
        .from('formia_documents')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString())

      // Nombre d'utilisateurs (seulement pour super_admin)
      let totalUsers = 0
      if (profile.role === 'super_admin') {
        const { count } = await supabase
          .from('formia_user_profiles')
          .select('*', { count: 'exact', head: true })
        totalUsers = count || 0
      }

      setStats({
        totalDocuments: totalDocs || 0,
        documentsThisMonth: docsThisMonth || 0,
        documentsToday: docsToday || 0,
        totalUsers
      })

      // Derniers documents (5 plus récents)
      const { data: docs } = await supabase
        .from('formia_documents')
        .select(`
          id,
          document_number,
          client_name,
          status,
          created_at,
          formia_agencies(name, code)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-slate-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec message de bienvenue */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            {getGreeting()}, {displayName} 👋
          </h1>
          <p className="text-red-100 text-lg">
            {profile?.role === 'super_admin' && '🔑 Super Administrateur'}
            {profile?.role === 'admin_agence' && '🏢 Administrateur Agence'}
            {profile?.role === 'technicien' && '⚙️ Technicien'}
            {' • '}
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Actions rapides */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-red-600 to-red-700 text-white border-0"
            onClick={() => router.push('/formia/nouveau')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm mb-1">Action principale</p>
                  <h3 className="text-2xl font-bold">Nouveau rapport</h3>
                </div>
                <PlusCircle className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          {(profile?.role === 'super_admin' || profile?.role === 'admin_agence') && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/formia/admin')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Gestion</p>
                    <h3 className="text-2xl font-bold text-slate-900">Administration</h3>
                  </div>
                  <Settings className="w-12 h-12 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          )}

          {profile?.role === 'super_admin' && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/formia/settings')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Configuration</p>
                    <h3 className="text-2xl font-bold text-slate-900">Paramètres</h3>
                  </div>
                  <Settings className="w-12 h-12 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 mb-1">Total rapports</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalDocuments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Ce mois</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Rapports du mois</p>
              <p className="text-3xl font-bold text-slate-900">{stats.documentsThisMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Aujourd'hui</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">Rapports du jour</p>
              <p className="text-3xl font-bold text-slate-900">{stats.documentsToday}</p>
            </CardContent>
          </Card>

          {profile?.role === 'super_admin' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-slate-600 mb-1">Utilisateurs</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Derniers rapports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Rapports récents
            </CardTitle>
            <CardDescription>Les 5 derniers rapports créés</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">Aucun rapport pour le moment</p>
                <p className="text-sm mb-4">Créez votre premier rapport de maintenance</p>
                <Button onClick={() => router.push('/formia/nouveau')} className="bg-red-600 hover:bg-red-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nouveau rapport
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{doc.document_number}</p>
                        <p className="text-sm text-slate-600">
                          {doc.client_name || 'Sans nom'} 
                          {doc.formia_agencies && ` • ${doc.formia_agencies.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {doc.status === 'completed' ? 'Terminé' : 'Brouillon'}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </p>
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
