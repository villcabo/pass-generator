"use client"

import { useState, useEffect } from "react"
import { Copy, RefreshCw, Settings, Shield, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
// Añadir un nuevo import para los tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PasswordConfig {
  length: number
  includeNumbers: boolean
  includeLowercase: boolean
  includeUppercase: boolean
  startWithLetter: boolean
  avoidSimilar: boolean
  avoidDuplicates: boolean
  avoidSequences: boolean
  customCharacters: string
  autoGenerate: boolean
  quantity: number
  viewMode: "detailed" | "export"
}

const defaultConfig: PasswordConfig = {
  length: 16,
  includeNumbers: true,
  includeLowercase: true,
  includeUppercase: true,
  startWithLetter: false,
  avoidSimilar: false,
  avoidDuplicates: false,
  avoidSequences: false,
  customCharacters: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  autoGenerate: true,
  quantity: 5,
  viewMode: "detailed",
}

const similarCharacters = "O0Il1"
const sequences = [
  "abc",
  "bcd",
  "cde",
  "def",
  "efg",
  "fgh",
  "ghi",
  "hij",
  "ijk",
  "jkl",
  "klm",
  "lmn",
  "mno",
  "nop",
  "opq",
  "pqr",
  "qrs",
  "rst",
  "stu",
  "tuv",
  "uvw",
  "vwx",
  "wxy",
  "xyz",
  "123",
  "234",
  "345",
  "456",
  "567",
  "678",
  "789",
  "890",
  "qwe",
  "wer",
  "ert",
  "rty",
  "tyu",
  "yui",
  "uio",
  "iop",
  "asd",
  "sdf",
  "dfg",
  "fgh",
  "ghj",
  "hjk",
  "jkl",
  "zxc",
  "xcv",
  "cvb",
  "vbn",
  "bnm",
]

export default function PasswordGenerator() {
  const [config, setConfig] = useState<PasswordConfig>(defaultConfig)
  const [passwords, setPasswords] = useState<string[]>([])
  // Añadir un nuevo estado para el modo de visualización después de la línea:
  // const [passwords, setPasswords] = useState<string[]>([])
  const { toast } = useToast()

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("passwordGeneratorConfig")
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig({ ...defaultConfig, ...parsed })
    }
  }, [])

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("passwordGeneratorConfig", JSON.stringify(config))
  }, [config])

  // Auto-generate passwords when config changes (if enabled)
  useEffect(() => {
    if (config.autoGenerate) {
      generatePasswords()
    }
  }, [config])

  const updateConfig = (key: keyof PasswordConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const getCharacterSet = (): string => {
    let charset = ""

    // Añadir caracteres base según los checkboxes
    if (config.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (config.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (config.includeNumbers) charset += "0123456789"

    // Añadir caracteres personalizados adicionales
    if (config.customCharacters.trim()) {
      charset += config.customCharacters
    }

    // Si no hay ningún checkbox seleccionado, usar configuración mínima
    if (!config.includeLowercase && !config.includeUppercase && !config.includeNumbers) {
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      if (config.customCharacters.trim()) {
        charset += config.customCharacters
      }
    }

    // Aplicar filtro de caracteres similares si está activado
    if (config.avoidSimilar) {
      charset = charset
        .split("")
        .filter((char) => !similarCharacters.includes(char))
        .join("")
    }

    // Eliminar duplicados que puedan surgir de la combinación
    charset = [...new Set(charset.split(""))].join("")

    return charset
  }

  const getLetterSet = (): string => {
    let letters = ""
    if (config.includeLowercase) letters += "abcdefghijklmnopqrstuvwxyz"
    if (config.includeUppercase) letters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    if (!letters && config.customCharacters.trim()) {
      letters = config.customCharacters
        .split("")
        .filter((char) => /[a-zA-Z]/.test(char))
        .join("")
    }

    if (config.avoidSimilar) {
      letters = letters
        .split("")
        .filter((char) => !similarCharacters.includes(char))
        .join("")
    }

    return letters || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  }

  const hasSequence = (password: string): boolean => {
    const lower = password.toLowerCase()
    return sequences.some((seq) => lower.includes(seq))
  }

  const hasDuplicates = (password: string): boolean => {
    return new Set(password).size !== password.length
  }

  const generateSinglePassword = (): string => {
    const charset = getCharacterSet()
    const letterSet = getLetterSet()

    if (!charset) return ""

    let attempts = 0
    const maxAttempts = 1000

    while (attempts < maxAttempts) {
      let password = ""

      // Start with letter if required
      if (config.startWithLetter && letterSet) {
        password += letterSet[Math.floor(Math.random() * letterSet.length)]
      }

      // Generate remaining characters
      const remainingLength = config.length - password.length
      for (let i = 0; i < remainingLength; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }

      // Check constraints
      let isValid = true

      if (config.avoidDuplicates && hasDuplicates(password)) {
        isValid = false
      }

      if (config.avoidSequences && hasSequence(password)) {
        isValid = false
      }

      if (isValid) {
        return password
      }

      attempts++
    }

    // Fallback: generate simple password if constraints are too restrictive
    let fallback = ""
    if (config.startWithLetter && letterSet) {
      fallback += letterSet[Math.floor(Math.random() * letterSet.length)]
    }

    const remainingLength = config.length - fallback.length
    for (let i = 0; i < remainingLength; i++) {
      fallback += charset[Math.floor(Math.random() * charset.length)]
    }

    return fallback
  }

  const generatePasswords = () => {
    const newPasswords: string[] = []
    for (let i = 0; i < config.quantity; i++) {
      newPasswords.push(generateSinglePassword())
    }
    setPasswords(newPasswords)
  }

  // Modificar la función copyToClipboard para que pueda copiar todas las contraseñas
  const copyToClipboard = async (password: string | string[]) => {
    try {
      let textToCopy = ""

      if (Array.isArray(password)) {
        textToCopy = password.join("\n")
      } else {
        textToCopy = password
      }

      await navigator.clipboard.writeText(textToCopy)
      toast({
        title: "¡Copiado!",
        description: Array.isArray(password)
          ? "Todas las contraseñas copiadas al portapapeles"
          : "Contraseña copiada al portapapeles",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar la contraseña",
        variant: "destructive",
      })
    }
  }

  const getStrengthBadge = () => {
    const isStrong = config.length >= 16
    return (
      <Badge
        variant={isStrong ? "default" : "secondary"}
        className={`ml-2 ${isStrong ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
      >
        {isStrong ? (
          <>
            <Shield className="w-3 h-3 mr-1" />
            Strong
          </>
        ) : (
          <>
            <ShieldAlert className="w-3 h-3 mr-1" />
            Weak
          </>
        )}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">Password Generator</h1>
          <p className="text-slate-600">Genera contraseñas seguras y personalizadas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración
                </CardTitle>
                <CardDescription>Personaliza tu generador de contraseñas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Length */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Longitud de contraseña
                    {getStrengthBadge()}
                  </Label>
                  <Select
                    value={config.length.toString()}
                    onValueChange={(value) => updateConfig("length", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 45 }, (_, i) => i + 6).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} caracteres
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label>Cantidad de contraseñas</Label>
                  <Select
                    value={config.quantity.toString()}
                    onValueChange={(value) => updateConfig("quantity", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} contraseña{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Character Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Incluir caracteres</Label>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="numbers"
                        checked={config.includeNumbers}
                        onCheckedChange={(checked) => updateConfig("includeNumbers", checked)}
                      />
                      <Label htmlFor="numbers" className="text-sm">
                        Números (0-9)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lowercase"
                        checked={config.includeLowercase}
                        onCheckedChange={(checked) => updateConfig("includeLowercase", checked)}
                      />
                      <Label htmlFor="lowercase" className="text-sm">
                        Minúsculas (a-z)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uppercase"
                        checked={config.includeUppercase}
                        onCheckedChange={(checked) => updateConfig("includeUppercase", checked)}
                      />
                      <Label htmlFor="uppercase" className="text-sm">
                        Mayúsculas (A-Z)
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Advanced Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Opciones avanzadas</Label>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="startLetter"
                        checked={config.startWithLetter}
                        onCheckedChange={(checked) => updateConfig("startWithLetter", checked)}
                      />
                      <Label htmlFor="startLetter" className="text-sm">
                        Iniciar con letra
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="avoidSimilar"
                        checked={config.avoidSimilar}
                        onCheckedChange={(checked) => updateConfig("avoidSimilar", checked)}
                      />
                      <Label htmlFor="avoidSimilar" className="text-sm">
                        Evitar similares (O,0,I,l)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="avoidDuplicates"
                        checked={config.avoidDuplicates}
                        onCheckedChange={(checked) => updateConfig("avoidDuplicates", checked)}
                      />
                      <Label htmlFor="avoidDuplicates" className="text-sm">
                        Evitar duplicados
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="avoidSequences"
                        checked={config.avoidSequences}
                        onCheckedChange={(checked) => updateConfig("avoidSequences", checked)}
                      />
                      <Label htmlFor="avoidSequences" className="text-sm">
                        Evitar secuencias
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoGenerate"
                        checked={config.autoGenerate}
                        onCheckedChange={(checked) => updateConfig("autoGenerate", checked)}
                      />
                      <Label htmlFor="autoGenerate" className="text-sm">
                        Generación automática
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Custom Characters */}
                <div className="space-y-2">
                  <Label htmlFor="customChars" className="text-sm font-medium">
                    Caracteres especiales adicionales
                  </Label>
                  <Input
                    id="customChars"
                    value={config.customCharacters}
                    onChange={(e) => updateConfig("customCharacters", e.target.value)}
                    placeholder="Ej: !@#$%^&*()..."
                    className="text-xs"
                  />
                  <p className="text-xs text-slate-500">
                    Caracteres adicionales que se combinarán con las opciones seleccionadas arriba
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Passwords */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contraseñas Generadas</CardTitle>
                    <CardDescription>
                      {passwords.length} contraseña{passwords.length !== 1 ? "s" : ""} de {config.length} caracteres
                    </CardDescription>
                  </div>
                  <Button onClick={generatePasswords} size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {passwords.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Haz clic en "Generar" para crear contraseñas</p>
                  </div>
                ) : (
                  <Tabs
                    defaultValue="detailed"
                    value={config.viewMode}
                    onValueChange={(v) => updateConfig("viewMode", v as "detailed" | "export")}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="detailed">Vista Detallada</TabsTrigger>
                      <TabsTrigger value="export">Vista para Exportar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detailed" className="space-y-3">
                      {passwords.map((password, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                        >
                          <code className="font-mono text-sm flex-1 mr-3 break-all">{password}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(password)}
                            className="shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="export">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg border">
                          <pre className="font-mono text-sm whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto">
                            {passwords.join("\n")}
                          </pre>
                        </div>
                        <Button onClick={() => copyToClipboard(passwords)} className="w-full">
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar todas las contraseñas
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
