#include<iostream>
using namespace std;

void solve(int n){
    if(n>5) return ;
    cout<<n*5<<endl;
    solve(n+1);
    }
int main(){
   int x=0;
    solve(x);  
}