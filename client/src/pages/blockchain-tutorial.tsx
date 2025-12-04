import { Link } from "wouter";
import { ArrowLeft, Shield, QrCode, CheckCircle, Lock, Globe, Database, Coffee, ExternalLink, Smartphone, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlockchainTutorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0705]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <a className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </Link>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white font-serif mb-4">
            Understanding Blockchain Verification
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            A simple guide to how Brew & Board uses blockchain technology to verify the authenticity of documents
          </p>
        </div>
        
        <div className="space-y-8">
          <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">What is a Blockchain?</h2>
                <p className="text-slate-300 leading-relaxed">
                  Think of blockchain as a <strong className="text-amber-400">digital notary book</strong> that everyone can see, 
                  but nobody can change. When something is written in this book, it stays there forever and can never be erased or altered.
                </p>
                <p className="text-slate-400 text-sm mt-3">
                  We use the <strong className="text-purple-400">Solana blockchain</strong> - one of the fastest and most 
                  efficient blockchain networks, processing thousands of verifications per second.
                </p>
              </div>
            </div>
          </section>
          
          <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">What is a Hallmark?</h2>
                <p className="text-slate-300 leading-relaxed">
                  A <strong className="text-amber-400">Hallmark</strong> is like a digital stamp of authenticity. 
                  Just like how gold jewelry has a hallmark to prove it's real, our digital hallmarks prove 
                  that a document is genuine and came from Brew & Board or one of our verified subscribers.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee className="w-5 h-5 text-amber-500" />
                      <span className="font-medium text-white">Company Hallmarks</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Format: <code className="text-amber-400">BB-0000000001</code>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Used for official Brew & Board documents and app versions
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-white">Personal Hallmarks</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Format: <code className="text-amber-400">BB-YOURNAME-000001</code>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Your own unique seal for your documents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">How Does Verification Work?</h2>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-white">You Create a Document</h3>
                      <p className="text-slate-400 text-sm">
                        When you stamp a document with your hallmark, we create a unique digital "fingerprint" of that document.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-white">We Record it on the Blockchain</h3>
                      <p className="text-slate-400 text-sm">
                        That fingerprint is permanently recorded on the Solana blockchain, where it can never be changed or deleted.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Anyone Can Verify</h3>
                      <p className="text-slate-400 text-sm">
                        Anyone with the QR code or hallmark number can instantly verify the document is authentic by checking the blockchain record.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">How to Verify a Document</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium text-white">Scan the QR Code</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Point your phone's camera at the QR code on the document. It will automatically take you to the verification page.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium text-white">Enter the Serial Number</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Go to <code className="text-amber-400">brewandboard.coffee/verify</code> and enter the hallmark number shown on the document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">What the Verification Shows</h2>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Whether the document is authentic and hasn't been tampered with</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Who issued the hallmark (company or subscriber)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">When the document was stamped</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">A link to the actual blockchain transaction on Solana</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">How many times the document has been verified</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 rounded-2xl p-6 border border-amber-600/30">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-3 font-serif">Get Your Personal Hallmark</h2>
              <p className="text-slate-300 mb-6 max-w-xl mx-auto">
                For just <strong className="text-amber-400">$1.99 one-time fee</strong>, you can mint your own personal hallmark 
                and start verifying your important documents on the blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/portfolio">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2" data-testid="button-get-hallmark">
                    <Shield className="w-4 h-4" />
                    Get My Hallmark
                  </Button>
                </Link>
                <a 
                  href="https://solana.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2" data-testid="link-learn-solana">
                    Learn More About Solana
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
            <Coffee className="w-5 h-5" />
            <span className="font-serif text-lg">Brew & Board Coffee</span>
          </div>
          <p className="text-xs text-slate-500">
            Blockchain-verified authenticity powered by Solana
          </p>
        </div>
      </div>
    </div>
  );
}
